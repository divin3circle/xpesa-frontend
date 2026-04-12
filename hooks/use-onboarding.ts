import { createClient } from "@/lib/supabase/client";
import { TABLENAMES } from "@/lib/supabase/utilities";
import { useQuery, useMutation } from "@tanstack/react-query"
import { toast } from "sonner";
import { redirect, useRouter } from "next/navigation";
import { onNavigate } from "@/lib/utils";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";


export interface OnboardingData {
  id: string;
  email: string;
  displayName: string;
  handle: string;
  bio: string;
  avatarUrl: string | null;
  walletAddress: string;
  mpesaNumber: string;
  onboardingStep: number;
  onboardingComplete: boolean;
}

async function createCreator({ creatorDetails }: {
  creatorDetails: OnboardingData
}) {
  if (creatorDetails.avatarUrl === null) {
    toast.error("Image URL absent.")
    return;
  }
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !user.id) return

    // upload the image to the storage bucket and get back a path 
    const blob = await fetch(creatorDetails.avatarUrl).then(res => res.blob());
    const fileName = `${user.id}.png`
    const { data, error } = await supabase.storage.from('xpesa-public').upload(`avatars/${fileName}`, blob, {
      cacheControl: '3600',
    })
    console.log("Image upload error", error)
    // create a row with available cretaor details
    const { data: creatorData, error: creatorError } = await supabase
      .from(TABLENAMES.CREATORS)
      .insert({
        id: user.id,
        email: creatorDetails.email,
        display_name: creatorDetails.displayName,
        handle: creatorDetails.handle,
        bio: creatorDetails.bio,
        avatar_url: data?.fullPath,
        wallet_address: creatorDetails.walletAddress,
        mpesa_number: creatorDetails.mpesaNumber,
        onboarding_step: creatorDetails.onboardingStep,
        onboarding_complete: creatorDetails.onboardingComplete
      });
    console.log("Creator create:", creatorData, creatorError)
  } catch (error) {
    toast.error("Couldn't set up your account. Please try again.")
    console.log(error)
  }
}



async function checkIfUserCompletedOnboarding({ router }: {
  router: AppRouterInstance
}): Promise<boolean> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    router.push("/login")
    return false
  }

  try {
    const { data, error } = await supabase.from(TABLENAMES.CREATORS).select('onboarding_complete').eq('id', user.id)
    if (!data || !data[0].onboarding_complete || error) return false;
    return true
  } catch (error) {
    console.log(error);
    return false
  }
}

export function useIsOnboardingComplete() {
  const router = useRouter()

  const { data, isLoading, error } = useQuery({
    queryKey: ['onboarding'],
    queryFn: () => checkIfUserCompletedOnboarding({ router }),
  })

  return { data, error, isLoading }
}

export function useCompleteOnboarding() {
  const router = useRouter()
  return useMutation({
    mutationFn: createCreator,
    onSuccess: () => {
      toast.success(
        "Setup complete. Welcome to xpesa. Get started with our docs.",
        {
          action: {
            label: "Learn more",
            onClick() {
              redirect("/learn")
            },
          },
        }
      )
      onNavigate("/dashboard", router)
    },
    onError: (error) => {
      console.log(error)
      toast.error(
        "Setup couldn't be completed",
        {
          description: error.message,
        }
      )
    }
  })
}
