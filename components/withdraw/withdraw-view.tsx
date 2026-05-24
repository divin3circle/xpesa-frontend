import { DrawerClose, DrawerFooter } from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Withdraw steps:
// 1: choose a method -> mobile or bank
// 2: enter relevant details for respective method
// 3: enter the usdc amount to withdraw
// 4: see summary and confirm transaction

interface OffRampSupport {
  name: string
  image: string
}

const offrampSteps = [
  {
    step: 1,
    title: "Choose an Offramp Option",
    description: "Where do you want your fiat to land?",
  },
  {
    step: 2,
    title: "Enter Details",
    description: "Which details should we use to send the money?",
  },
  {
    step: 3,
    title: "Enter Withdraw Amount",
    description: "How much crypto do you want to withdraw?",
  },
  {
    step: 4,
    title: "Confirm & Process",
    description: "Are these details correct?",
  },
]

const mobileOptions: OffRampSupport[] = [
  {
    name: 'Safaricom(M-Pesa)',
    image: '/saf.jpg'
  },
  {
    name: "MTN Mobile",
    image: "/mtn.svg"
  },
  {
    name: "Airtel Money",
    image: "/airtel.png"
  }
]
const bankOptions: OffRampSupport[] = [
  {
    name: "Equity Bank",
    image: "/equity.png"
  },
  {
    name: "ABSA Bank",
    image: "/absa.jpg"
  },
  {
    name: "KCB Bank",
    image: "/kcb.jpeg"
  },
  {
    name: "Standard Chartered",
    image: "/stanchart.png"
  }
]

const offRampOptions = [
  {
    id: 1,
    name: "Mobile Money",
    description:
      "Convert your digital assets into local mobile money instantly. With support for more than 14 countries and 5 popular carriers.",
    supports: mobileOptions,
  },
  {
    id: 2,
    name: "Bank Transfer",
    description:
      "Convert your digital assets into local bank accounts instantly. Supports major regional banks with real-time settlement.",
    supports: bankOptions,
  },
]

function ProgressHeader({currentStep}: {
  currentStep: number,
}) {
  return (
    <div className="flex w-full items-center justify-between gap-2">
      {offrampSteps.map((step) => (
        <div
          key={step.step}
          className={`h-1 w-1/4 rounded-lg ${currentStep >= step.step ? "bg-chart-1" : "bg-foreground/30"}`}
        />
      ))}
    </div>
  )
}

function OffRampOption({ option} : {
  option: {
    id: number
    name: string
    description: string
    supports: OffRampSupport[]
  }
}){
  return (
    <div className="rounded-2xl cursor-pointer hover:bg-foreground/5 transition-all ease-in duration-200 hover:scale-[99%] my-2 border border/75 p-4 w-full">
      <h1 className="font-heading font-semibold text-lg mb-1">{option.name}</h1>
      <p className="text-sm text-foreground/70">{option.description}</p>
     <div className="mt-2 flex items-center justify-between">
       <p className="text-sm text-muted-foreground">Available options: </p>
       <div className="flex items-center gap-0">
         {
           option.supports.map(support => (
             <Image key={support.name} src={support.image} alt={support.name} height={500} width={500} className="rounded-full -ml-2 border border/75 size-8 md:size-10 object-cover" />
           ))
         }
       </div>
     </div>
    </div>
  )
}

function EnterOfframpDetails() {

  function mobileForm() {
    return (
      <div className="w-full">
        <div className="flex items-center gap-2 mt-2">
          <div>
            <p className="">Country Code</p>
            <Select>
              <SelectTrigger className="w-[80px]">
                <SelectValue placeholder="+254" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="254">Kenya</SelectItem>
                  <SelectItem value="256">Uganda</SelectItem>
                  <SelectItem value="257">Tanzania</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    )
  }

  function bankForm() {
   return (
     <div>
       <p>Bank</p>
     </div>
   )
  }

  function renderRelevantForm(isMobile: boolean) {
    return isMobile ? mobileForm() : bankForm()
  }

  return renderRelevantForm(true)
}

function SelectOffRampOption(){
  return (
    <div className="w-full">
      {
        offRampOptions.map((option, index) => (
          <OffRampOption option={option} key={index} />
        ))
      }
    </div>
  )
}

export default function WithdrawAction(){
  return (
    <div className="my-4 w-full flex flex-col items-center gap-4">
      <ProgressHeader currentStep={1} />
     <EnterOfframpDetails />
    </div>
  )
}

