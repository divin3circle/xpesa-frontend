
import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

function SearchBar() {
  return (
    <Field orientation="horizontal">
      <Input type="search" placeholder="Find action..." />
      <Button>Search</Button>
    </Field>
  )
}

export default function Header(){
  return (
    <div className="flex items-center justify-between border-b border-border/75 pb-4">
      <h1 className="text-heading hidden md:block text-xl md:text-2xl font-semibold">Wallet</h1>
      <div className="w-full md:w-md">
        <SearchBar />
      </div>
    </div>
  )
}