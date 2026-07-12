"use client"

import { useEffect, useMemo } from "react"
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
import { Input } from "../ui/input"
import { useForm, Controller, useWatch, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import { StarsFreeIcons } from "@hugeicons/core-free-icons"
import { useKotaniOfframp } from "@/hooks/use-kotani-offramp"
import { useKotaniRates } from "@/hooks/use-kotani-rates"
import {
  KOTANI_COUNTRY_OPTIONS,
  KOTANI_CURRENCY_OPTIONS,
  KOTANI_FALLBACK_RATES,
  KOTANI_NETWORKS,
  KOTANI_OFFRAMP_OPTIONS,
  KOTANI_OFFRAMP_STEPS,
  type KotaniOfframpMethod,
  type KotaniNetwork,
  type KotaniSupportOption,
} from "@/lib/kotani-pay"
import {
  kotaniOfframpBeneficiarySchema,
  kotaniOfframpQuoteSchema,
  type KotaniOfframpDraft,
} from "@/lib/kotani-pay.schema"
import type { KotaniOfframpQuote } from "@/lib/kotani-pay.store"

type BeneficiaryFormValues = z.infer<typeof kotaniOfframpBeneficiarySchema>
type QuoteFormValues = z.infer<typeof kotaniOfframpQuoteSchema>
type OfframpStoreSnapshot = {
  draft: KotaniOfframpDraft
  currentStep: number
  quote: KotaniOfframpQuote | null
  isQuoteLoading: boolean
  quoteError: string | null
  setCurrentStep: (step: number) => void
  setDraft: (patch: Partial<KotaniOfframpDraft>) => void
  setQuote: (quote: KotaniOfframpQuote | null) => void
  setQuoteLoading: (isLoading: boolean) => void
  setQuoteError: (error: string | null) => void
}

const networkLabels: Record<string, string> = {
  mpesa: "M-Pesa",
  airtel: "Airtel",
  mtn: "MTN",
  vodafone: "Vodafone",
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(value)
}

function extractRatePayload(data: unknown) {
  if (!data) return null
  if (typeof data !== "object") return null
  const record = data as Record<string, unknown>
  const payload = record.data
  return payload && typeof payload === "object"
    ? (payload as Record<string, unknown>)
    : null
}

function getRateValue(payload: Record<string, unknown> | null) {
  if (!payload) return null
  const value =
    (payload.value as number | string | undefined) ??
    (payload.rate as number | string | undefined)
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : null
}

function getRateId(payload: Record<string, unknown> | null) {
  if (!payload) return ""
  const rateId =
    (payload.rateId as string | undefined) ??
    (payload.id as string | undefined) ??
    (payload.rate_id as string | undefined)
  return rateId ?? ""
}

function ProgressHeader({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex w-full items-center justify-between gap-2">
      {KOTANI_OFFRAMP_STEPS.map((step) => (
        <div
          key={step.step}
          className={`h-1 w-1/4 rounded-lg ${currentStep >= step.step ? "bg-chart-1" : "bg-foreground/30"}`}
        />
      ))}
    </div>
  )
}

function OffRampOption({
  option,
  isSelected,
  onSelect,
}: {
  option: {
    id: number
    name: string
    description: string
    supports: KotaniSupportOption[]
  }
  isSelected: boolean
  onSelect: () => void
}) {
  return (
    <div
      className={`border/75 my-2 w-full cursor-pointer rounded-2xl border p-4 transition-all duration-200 ease-in hover:scale-[99%] hover:bg-foreground/5 ${isSelected ? "border-chart-1 bg-chart-1/10" : ""}`}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          onSelect()
        }
      }}
      aria-pressed={isSelected}
    >
      <h1 className="mb-1 font-heading text-lg font-semibold">{option.name}</h1>
      <p className="text-sm text-foreground/70">{option.description}</p>
      <div className="mt-2 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Available options: </p>
        <div className="flex items-center gap-0">
          {option.supports.map((support) => (
            <Image
              key={support.name}
              src={support.image}
              alt={support.name}
              height={500}
              width={500}
              className="border/75 -ml-2 size-8 rounded-full border object-cover md:size-10"
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export function EnterOfframpDetails({
  method,
  defaultValues,
  onBack,
  onNext,
  onSelectionChange,
}: {
  method: KotaniOfframpMethod
  defaultValues: KotaniOfframpDraft
  onBack: () => void
  onNext: (values: BeneficiaryFormValues) => void
  onSelectionChange: (patch: Partial<KotaniOfframpDraft>) => void
}) {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BeneficiaryFormValues>({
    resolver: zodResolver(
      kotaniOfframpBeneficiarySchema
    ) as Resolver<BeneficiaryFormValues>,
    defaultValues: {
      accountName: defaultValues.accountName,
      mobileCountryCode: defaultValues.mobileCountryCode,
      mobileNumber: defaultValues.mobileNumber,
      accountNumber: defaultValues.accountNumber,
      address: defaultValues.address,
    },
  })

  const submitDetails = handleSubmit((values) => onNext(values))

  function mobileForm() {
    return (
      <div className="w-full px-2">
        <p className="mt-2 mb-1 text-sm text-foreground/70">Mobile Number</p>
        <div className="flex w-full items-center gap-2">
          <Controller
            control={control}
            name="mobileCountryCode"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-20.50">
                  <SelectValue placeholder="+254" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {KOTANI_COUNTRY_OPTIONS.map((option) => (
                      <SelectItem key={option.dialCode} value={option.dialCode}>
                        {option.dialCode}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          />
          <Input
            placeholder="712345678"
            className="w-full max-w-sm"
            {...register("mobileNumber")}
          />
        </div>
        {errors.mobileNumber ? (
          <p className="mt-1 text-xs text-destructive">
            {errors.mobileNumber.message}
          </p>
        ) : null}
        <p className="mt-4 mb-1 text-sm text-foreground/70">Account Name</p>
        <Input
          placeholder="Sylus Abel"
          className="w-full max-w-md"
          {...register("accountName")}
        />
        {errors.accountName ? (
          <p className="mt-1 text-xs text-destructive">
            {errors.accountName.message}
          </p>
        ) : null}
        <p className="mt-4 mb-1 text-sm text-foreground/70">Network Provider</p>
        <Select
          value={defaultValues.network}
          onValueChange={(value) =>
            onSelectionChange({ network: value as KotaniNetwork })
          }
        >
          <SelectTrigger className="w-full max-w-sm">
            <SelectValue placeholder="M-Pesa" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {KOTANI_NETWORKS.map((network) => (
                <SelectItem key={network} value={network}>
                  {networkLabels[network] ?? network.toUpperCase()}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <div className="mt-6 flex items-center justify-between">
          <Button variant="outline" onClick={onBack}>
            Previous
          </Button>
          <Button className="w-2/3" onClick={submitDetails}>
            Next
          </Button>
        </div>
      </div>
    )
  }

  function bankForm() {
    return (
      <div className="w-full px-2">
        <p className="mt-4 mb-1 text-sm text-foreground/70">Account Name</p>
        <Input
          placeholder="Sylus Abel"
          className="w-full max-w-md"
          {...register("accountName")}
        />
        {errors.accountName ? (
          <p className="mt-1 text-xs text-destructive">
            {errors.accountName.message}
          </p>
        ) : null}
        <p className="mt-2 mb-1 text-sm text-foreground/70">Mobile Number</p>
        <div className="flex w-full items-center gap-2">
          <Controller
            control={control}
            name="mobileCountryCode"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-20.50">
                  <SelectValue placeholder="+254" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {KOTANI_COUNTRY_OPTIONS.map((option) => (
                      <SelectItem key={option.dialCode} value={option.dialCode}>
                        {option.dialCode}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          />
          <Input
            placeholder="712345678"
            className="w-full max-w-sm"
            {...register("mobileNumber")}
          />
        </div>
        {errors.mobileNumber ? (
          <p className="mt-1 text-xs text-destructive">
            {errors.mobileNumber.message}
          </p>
        ) : null}
        <p className="mt-2 mb-1 text-sm text-foreground/70">Account Number</p>
        <Input
          placeholder="123456789"
          className="w-full max-w-md"
          {...register("accountNumber")}
        />
        <p className="mt-2 mb-1 text-sm text-foreground/70">Address</p>
        <Input
          placeholder="123 Main Street"
          className="w-full max-w-md"
          {...register("address")}
        />
        <div className="mt-4 flex items-center justify-between gap-2">
          <div className="w-1/2">
            <p className="mb-1 text-sm text-foreground/70">Country</p>
            <Select
              value={defaultValues.countryCode}
              onValueChange={(value) =>
                onSelectionChange({
                  countryCode: value as KotaniOfframpDraft["countryCode"],
                })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Kenya" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {KOTANI_COUNTRY_OPTIONS.map((option) => (
                    <SelectItem key={option.code} value={option.code}>
                      {option.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="w-1/2">
            <p className="mb-1 text-sm text-foreground/70">Bank</p>
            <Select
              value={defaultValues.bankName}
              onValueChange={(value) => onSelectionChange({ bankName: value })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="ABSA Bank" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="ABSA Bank">ABSA Bank</SelectItem>
                  <SelectItem value="Equity Bank">Equity Bank</SelectItem>
                  <SelectItem value="Standard Chartered">
                    Standard Chartered
                  </SelectItem>
                  <SelectItem value="KCB Bank">KCB Bank</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <Button variant="outline" onClick={onBack}>
            Previous
          </Button>
          <Button className="w-2/3" onClick={submitDetails}>
            Next
          </Button>
        </div>
      </div>
    )
  }

  return method === "mobile_money" ? mobileForm() : bankForm()
}

export function SelectOffRampOption({
  selectedMethod,
  onSelect,
  onNext,
}: {
  selectedMethod: KotaniOfframpMethod
  onSelect: (method: KotaniOfframpMethod) => void
  onNext: () => void
}) {
  return (
    <div className="w-full">
      {KOTANI_OFFRAMP_OPTIONS.map((option) => (
        <OffRampOption
          option={option}
          key={option.id}
          isSelected={selectedMethod === option.method}
          onSelect={() => onSelect(option.method)}
        />
      ))}
      <div className="mt-6 flex items-center justify-between">
        <Button variant="outline" disabled>
          Previous
        </Button>
        <Button className="w-2/3" onClick={onNext}>
          Next
        </Button>
      </div>
    </div>
  )
}

export function EnterAmount({
  draft,
  quote,
  isQuoteLoading,
  quoteError,
  onBack,
  onNext,
  onDraftChange,
  onQuoteChange,
  onQuoteLoading,
  onQuoteError,
}: {
  draft: KotaniOfframpDraft
  quote: KotaniOfframpQuote | null
  isQuoteLoading: boolean
  quoteError: string | null
  onBack: () => void
  onNext: (values: QuoteFormValues) => void
  onDraftChange: (patch: Partial<KotaniOfframpDraft>) => void
  onQuoteChange: (quote: KotaniOfframpQuote | null) => void
  onQuoteLoading: (isLoading: boolean) => void
  onQuoteError: (error: string | null) => void
}) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<QuoteFormValues>({
    resolver: zodResolver(
      kotaniOfframpQuoteSchema
    ) as Resolver<QuoteFormValues>,
    defaultValues: {
      amountUsdc: draft.amountUsdc,
      estimatedFiatAmount: draft.estimatedFiatAmount,
      rateId: draft.rateId,
      provider: draft.provider,
      referenceId: draft.referenceId,
      callbackUrl: draft.callbackUrl,
      step: 3,
    },
  })

  const submitAmount = handleSubmit((values) => onNext(values))

  const amountUsdc = useWatch({ control, name: "amountUsdc" })

  const ratesQuery = useKotaniRates(draft.currencyCode)
  const ratePayload = useMemo(
    () => extractRatePayload(ratesQuery.data),
    [ratesQuery.data]
  ) as Record<string, unknown> | null
  const rateValue = useMemo(() => getRateValue(ratePayload), [ratePayload])
  const rateId = useMemo(() => getRateId(ratePayload), [ratePayload])

  useEffect(() => {
    onQuoteLoading(ratesQuery.isLoading)
  }, [onQuoteLoading, ratesQuery.isLoading])

  useEffect(() => {
    const message = ratesQuery.error
      ? ratesQuery.error instanceof Error
        ? ratesQuery.error.message
        : "Failed to fetch rates"
      : null
    onQuoteError(message)
  }, [onQuoteError, ratesQuery.error])

  useEffect(() => {
    if (!amountUsdc) {
      onDraftChange({ amountUsdc: "", estimatedFiatAmount: "", rateId: "" })
      onQuoteChange(null)
      return
    }
    onDraftChange({ amountUsdc })
  }, [amountUsdc, onDraftChange, onQuoteChange])

  const effectiveRate =
    rateValue ?? KOTANI_FALLBACK_RATES[draft.currencyCode] ?? null

  const estimatedFiatAmount = useMemo(() => {
    const amountNumber = Number(amountUsdc)
    if (!Number.isFinite(amountNumber) || amountNumber <= 0 || !effectiveRate) {
      return ""
    }
    return formatNumber(amountNumber * effectiveRate)
  }, [amountUsdc, effectiveRate])

  useEffect(() => {
    if (!estimatedFiatAmount || !effectiveRate) return
    const amountNumber = Number(amountUsdc)
    if (!Number.isFinite(amountNumber) || amountNumber <= 0) return
    const nextQuote: KotaniOfframpQuote = {
      rateId: rateId,
      rate: effectiveRate,
      estimatedFiatAmount,
      sourceAmountUsdc: amountUsdc,
      destinationCurrency: draft.currencyCode,
      fetchedAt: new Date().toISOString(),
    }
    onQuoteChange(nextQuote)
    onDraftChange({
      estimatedFiatAmount,
      rateId: rateId,
    })
  }, [
    amountUsdc,
    draft.currencyCode,
    estimatedFiatAmount,
    onDraftChange,
    onQuoteChange,
    rateId,
    effectiveRate,
  ])

  const displayRate = effectiveRate ? formatNumber(effectiveRate) : "--"
  const displayEstimate =
    estimatedFiatAmount ||
    draft.estimatedFiatAmount ||
    quote?.estimatedFiatAmount ||
    "--"

  return (
    <div className="w-full px-2">
      <div className="border/75 mt-2 w-full gap-2 rounded-2xl border p-4">
        <div className="flex items-center justify-between">
          <div className="mb-4 flex items-center gap-2">
            <Image
              src="/usdc.svg"
              alt="usdc-icon"
              width={256}
              height={256}
              className="size-10"
            />
            <div>
              <div className="flex">
                {" "}
                <p className="mr-1 font-semibold text-blue-500 underline">
                  USDC
                </p>
                {"on "}
                <p className="ml-1 font-semibold text-orange-500 underline">
                  Avalanche
                </p>
              </div>
              <p className="text-sm text-foreground/70">
                1 USDC ≈ {draft.currencyCode} {displayRate}
              </p>
            </div>
          </div>
          <Select
            value={draft.currencyCode}
            onValueChange={(value) =>
              onDraftChange({
                currencyCode: value as KotaniOfframpDraft["currencyCode"],
              })
            }
          >
            <SelectTrigger className="w-20.50">
              <SelectValue placeholder={draft.currencyCode} />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {KOTANI_CURRENCY_OPTIONS.map((option) => (
                  <SelectItem key={option.code} value={option.code}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <Input
          placeholder="$0.00"
          className="bg-transparent p-2 text-4xl font-semibold focus-visible:border-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:text-[46px]"
          {...register("amountUsdc")}
        />
        {errors.amountUsdc ? (
          <p className="mt-1 text-xs text-destructive">
            {errors.amountUsdc.message}
          </p>
        ) : null}
        {quoteError ? (
          <p className="mt-1 text-xs text-destructive">{quoteError}</p>
        ) : null}
        <p className="mt-2 text-sm text-foreground/70">
          Available balance: $23,567.84
        </p>
      </div>
      <div className="border/75 mt-2 w-full gap-2 rounded-2xl border p-4">
        <div className="flex items-center justify-between">
          <div className="mb-4 flex items-center gap-2">
            <Image
              src="/mpesa.png"
              alt="fiat"
              width={256}
              height={256}
              className="size-10"
            />
            <div>
              <div className="flex">
                {" "}
                <p className="mr-1 font-semibold text-muted-foreground underline">
                  {draft.currencyCode}
                </p>
                {"on "}
                <p className="ml-1 font-semibold text-muted-foreground underline">
                  {draft.method === "mobile_money"
                    ? (networkLabels[draft.network] ?? "Mobile Money")
                    : draft.bankName || "Bank Transfer"}
                </p>
              </div>
              <p className="text-sm text-foreground/70">You&apos;ll receive:</p>
            </div>
          </div>
        </div>
        <p className="bg-transparent p-2 text-4xl font-semibold focus-visible:border-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:text-[46px]">
          <span className="mr-2">{draft.currencyCode}</span>
          {displayEstimate}
        </p>
        {isQuoteLoading ? (
          <p className="mt-1 text-xs text-foreground/60">Updating rate...</p>
        ) : null}
        <p className="mt-2 text-sm text-foreground/70">
          Available balance: $23,567.84
        </p>
      </div>
      <div className="mt-6 flex items-center justify-between">
        <Button variant="outline" onClick={onBack}>
          Previous
        </Button>
        <Button className="w-2/3" onClick={submitAmount}>
          Next
        </Button>
      </div>
    </div>
  )
}

function Summary({
  draft,
  quote,
  onBack,
  onConfirm,
}: {
  draft: KotaniOfframpDraft
  quote: KotaniOfframpQuote | null
  onBack: () => void
  onConfirm: () => void
}) {
  const amountText = draft.amountUsdc
    ? formatNumber(Number(draft.amountUsdc))
    : "0"
  const receiver =
    draft.method === "mobile_money"
      ? `${draft.mobileCountryCode}${draft.mobileNumber}`
      : draft.bankName || "Bank Transfer"
  const estimated =
    draft.estimatedFiatAmount || quote?.estimatedFiatAmount || "--"

  return (
    <div className="w-full px-2">
      <h1 className="text-heading text-xl font-semibold">Summary</h1>
      <p className="border-beam mt-2 rounded-2xl border border-chart-1/30 px-2 py-3 text-sm text-foreground/70">
        <HugeiconsIcon icon={StarsFreeIcons} />
        You are about to withdraw ${amountText} USDC to your
        {draft.method === "mobile_money" ? " mobile money" : " bank"} account
        linked to {receiver}. The estimated amount you will receive is{" "}
        {draft.currencyCode} {estimated}. Please review the details before
        confirming the transaction.
      </p>
      <div className="mt-2 flex flex-col gap-2">
        <div className="flex items-center justify-between border-b border-dashed border-foreground/30 py-2">
          <p className="text-sm text-muted-foreground">From</p>
          <div className="flex items-center gap-2">
            <Image
              src="/usdc.svg"
              alt="usdc-icon"
              width={256}
              height={256}
              className="size-6"
            />
            <div>
              <p className="text-sm text-foreground/70">Avalanche Mainnet</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between border-b border-dashed border-foreground/30 py-2">
          <p className="text-sm text-muted-foreground">To</p>
          <div className="flex items-center gap-2">
            <Image
              src={
                draft.method === "mobile_money" ? "/mpesa.png" : "/unknown.avif"
              }
              alt="fiat"
              width={256}
              height={256}
              className="size-6"
            />
            <div>
              <p className="text-sm text-foreground/70">{receiver}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between border-b border-dashed border-foreground/30 py-2">
          <p className="text-sm text-muted-foreground">Provider</p>
          <div className="flex items-center gap-2">
            <div>
              <p className="text-sm text-foreground/70">
                {draft.provider}:{" "}
                {draft.method === "mobile_money"
                  ? "Mobile Money"
                  : "Bank Transfer"}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between border-b border-dashed border-foreground/30 py-2">
          <p className="text-sm text-muted-foreground">Amount</p>
          <div className="flex items-center gap-2">
            <div>
              <p className="text-sm text-foreground/70">
                {draft.currencyCode} {estimated}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between border-b border-dashed border-foreground/30 py-2">
          <p className="text-sm text-muted-foreground">Account Name</p>
          <div className="flex items-center gap-2">
            <div>
              <p className="text-sm text-foreground/70">
                {draft.accountName || "--"}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6 flex items-center justify-between">
        <Button variant="outline" onClick={onBack}>
          Previous
        </Button>
        <Button className="w-2/3" onClick={onConfirm}>
          Confirm & Withdraw
        </Button>
      </div>
    </div>
  )
}

export default function WithdrawAction() {
  const offramp = useKotaniOfframp() as OfframpStoreSnapshot
  const {
    draft,
    currentStep,
    quote,
    isQuoteLoading,
    quoteError,
    setCurrentStep,
    setDraft,
    setQuote,
    setQuoteLoading,
    setQuoteError,
  } = offramp

  const safeStep = Math.min(Math.max(currentStep, 1), 4)
  const stepMeta = KOTANI_OFFRAMP_STEPS.find((step) => step.step === safeStep)

  function goToStep(step: number) {
    setCurrentStep(step)
    setDraft({ step })
  }

  return (
    <div className="my-4 flex w-full flex-col items-center gap-4">
      <ProgressHeader currentStep={safeStep} />
      {stepMeta ? (
        <div className="w-full px-2">
          <h2 className="text-heading text-lg font-semibold">
            {stepMeta.title}
          </h2>
          <p className="text-sm text-foreground/70">{stepMeta.description}</p>
        </div>
      ) : null}
      {safeStep === 1 ? (
        <SelectOffRampOption
          selectedMethod={draft.method}
          onSelect={(method) => setDraft({ method })}
          onNext={() => goToStep(2)}
        />
      ) : null}
      {safeStep === 2 ? (
        <EnterOfframpDetails
          method={draft.method}
          defaultValues={draft}
          onBack={() => goToStep(1)}
          onNext={(values) => {
            setDraft(values)
            goToStep(3)
          }}
          onSelectionChange={setDraft}
        />
      ) : null}
      {safeStep === 3 ? (
        <EnterAmount
          draft={draft}
          quote={quote}
          isQuoteLoading={isQuoteLoading}
          quoteError={quoteError}
          onBack={() => goToStep(2)}
          onNext={(values) => {
            setDraft(values)
            goToStep(4)
          }}
          onDraftChange={setDraft}
          onQuoteChange={setQuote}
          onQuoteLoading={setQuoteLoading}
          onQuoteError={setQuoteError}
        />
      ) : null}
      {safeStep === 4 ? (
        <Summary
          draft={draft}
          quote={quote}
          onBack={() => goToStep(3)}
          onConfirm={() => {
            void draft
            void quote
            toast.info("Withdrawal submission is not live yet.")
          }}
        />
      ) : null}
    </div>
  )
}
