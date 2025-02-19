"use client"

import { useState, useEffect } from "react"
import { Button } from "../components/ui/button"
import { Checkbox } from "../components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../components/ui/dialog"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { CreditCard } from "lucide-react"
import { useId } from "react"

const validateNameOnCard = (name: string) => {
  return /^[A-Za-z\s]+$/.test(name)
}

const validateCardNumber = (number: string) => {
  return /^(\d{4}\s?){4}$/.test(number.replace(/\s/g, ""))
}

const validateExpiryDate = (date: string) => {
  const [month, year] = date.split("/")
  const currentYear = new Date().getFullYear() % 100
  const currentMonth = new Date().getMonth() + 1

  if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(date)) return false
  if (Number.parseInt(year) < currentYear) return false
  if (Number.parseInt(year) === currentYear && Number.parseInt(month) < currentMonth) return false

  return true
}

const validateCvc = (cvc: string) => {
  return /^\d{3}$/.test(cvc)
}

export function UpdateCardDialog({
  isOpen,
  onClose,
  onCancel,
}: {
  isOpen: boolean
  onClose: () => void
  onCancel: () => void
}) {
  const id = useId()
  const [nameOnCard, setNameOnCard] = useState("")
  const [cardNumber, setCardNumber] = useState("")
  const [expiryDate, setExpiryDate] = useState("")
  const [cvc, setCvc] = useState("")
  const [errors, setErrors] = useState({
    nameOnCard: "",
    cardNumber: "",
    expiryDate: "",
    cvc: "",
  })
  const [isFormValid, setIsFormValid] = useState(false)

  useEffect(() => {
    const newErrors = {
      nameOnCard: validateNameOnCard(nameOnCard) ? "" : "Invalid Name on Card",
      cardNumber: validateCardNumber(cardNumber) ? "" : "Invalid Card Number",
      expiryDate: validateExpiryDate(expiryDate) ? "" : "Invalid Expiry Date",
      cvc: validateCvc(cvc) ? "" : "Invalid CVC",
    }
    setErrors(newErrors)

    setIsFormValid(
      validateNameOnCard(nameOnCard) &&
        validateCardNumber(cardNumber) &&
        validateExpiryDate(expiryDate) &&
        validateCvc(cvc),
    )
  }, [nameOnCard, cardNumber, expiryDate, cvc])

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ""
    const parts = []

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }

    if (parts.length) {
      return parts.join(" ")
    } else {
      return value
    }
  }

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatCardNumber(e.target.value)
    setCardNumber(formattedValue)
  }

  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "")
    if (value.length > 2) {
      value = value.slice(0, 2) + "/" + value.slice(2, 4)
    }
    setExpiryDate(value)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-left">Add card</DialogTitle>
          <DialogDescription className="text-left">Add a new card to your account.</DialogDescription>
        </DialogHeader>

        <form className="space-y-5">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`name-${id}`}>Name on card</Label>
              <Input
                id={`name-${id}`}
                type="text"
                required
                value={nameOnCard}
                onChange={(e) => setNameOnCard(e.target.value)}
              />
              {errors.nameOnCard && <p className="text-red-500 text-sm">{errors.nameOnCard}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor={`number-${id}`}>Card Number</Label>
              <div className="relative">
                <Input
                  id={`number-${id}`}
                  className="peer pe-9 [direction:inherit]"
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  maxLength={19}
                />
                <div className="pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-3 text-muted-foreground/80 peer-disabled:opacity-50">
                  <CreditCard size={16} strokeWidth={2} aria-hidden="true" />
                </div>
              </div>
              {errors.cardNumber && <p className="text-red-500 text-sm">{errors.cardNumber}</p>}
            </div>
            <div className="flex gap-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor={`expiry-${id}`}>Expiry date</Label>
                <Input
                  className="[direction:inherit]"
                  id={`expiry-${id}`}
                  placeholder="MM/YY"
                  value={expiryDate}
                  onChange={handleExpiryDateChange}
                  maxLength={5}
                />
                {errors.expiryDate && <p className="text-red-500 text-sm">{errors.expiryDate}</p>}
              </div>
              <div className="flex-1 space-y-2">
                <Label htmlFor={`cvc-${id}`}>CVC</Label>
                <Input
                  className="[direction:inherit]"
                  id={`cvc-${id}`}
                  placeholder="CVC"
                  value={cvc}
                  onChange={(e) => setCvc(e.target.value)}
                  maxLength={3}
                />
                {errors.cvc && <p className="text-red-500 text-sm">{errors.cvc}</p>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id={`primary-${id}`} />
            <Label htmlFor={`primary-${id}`} className="font-normal text-muted-foreground">
              Set as default payment method
            </Label>
          </div>
          <div className="grid gap-2">
            <Button type="button" className="w-full" onClick={onClose} disabled={!isFormValid}>
              Pay
            </Button>
            <Button type="button" variant="ghost" className="w-full" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

