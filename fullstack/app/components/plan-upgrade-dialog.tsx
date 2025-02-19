"use client"

import { useState } from "react"
import { Button } from "../components/ui/button"
import { Label } from "../components/ui/label"
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group"
import { Check } from "lucide-react"
import { useId } from "react"

interface PlanUpgradeDialogProps {
  isCardAdded: boolean
  onAddCard: () => void
  onUpgrade: (plan: string) => void
  currentPlan: string
}

export function PlanUpgradeDialog({ isCardAdded, onAddCard, onUpgrade, currentPlan }: PlanUpgradeDialogProps) {
  const id = useId()
  const [selectedPlan, setSelectedPlan] = useState(currentPlan === "Premium" ? "2" : "1")

  const handleChangePlan = () => {
    if (selectedPlan === "2" && !isCardAdded) {
      onAddCard() // This will trigger the switch to the "Add Card" panel
    } else {
      onUpgrade(selectedPlan === "1" ? "Standard" : "Premium")
    }
  }

  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-bold">Change your plan</h2>
      <p className="text-left">Current plan: {currentPlan}</p>
      <p className="text-left">Pick one of the following plans.</p>
      <form className="space-y-5">
        <RadioGroup className="gap-2" value={selectedPlan} onValueChange={setSelectedPlan}>
          <div className="relative flex w-full items-center gap-2 rounded-lg border border-input px-4 py-3 shadow-sm shadow-black/5 has-[[data-state=checked]]:border-ring has-[[data-state=checked]]:bg-accent">
            <RadioGroupItem
              value="1"
              id={`${id}-1`}
              aria-describedby={`${id}-1-description`}
              className="order-1 after:absolute after:inset-0"
            />
            <div className="grid grow gap-1">
              <Label htmlFor={`${id}-1`}>Standard</Label>
              <p id={`${id}-1-description`} className="text-xs text-muted-foreground">
                $0 per month
              </p>
            </div>
          </div>
          <div className="relative flex w-full items-center gap-2 rounded-lg border border-input px-4 py-3 shadow-sm shadow-black/5 has-[[data-state=checked]]:border-ring has-[[data-state=checked]]:bg-accent">
            <RadioGroupItem
              value="2"
              id={`${id}-2`}
              aria-describedby={`${id}-2-description`}
              className="order-1 after:absolute after:inset-0"
            />
            <div className="grid grow gap-1">
              <Label htmlFor={`${id}-2`}>Premium</Label>
              <p id={`${id}-2-description`} className="text-xs text-muted-foreground">
                $20 per month
              </p>
            </div>
          </div>
        </RadioGroup>

        <div className="space-y-3">
          <p>
            <strong className="text-sm font-medium">Features include:</strong>
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <Check size={16} strokeWidth={2} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
              Create unlimited projects.
            </li>
            <li className="flex gap-2">
              <Check size={16} strokeWidth={2} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
              Remove watermarks.
            </li>
            <li className="flex gap-2">
              <Check size={16} strokeWidth={2} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
              Upload unlimited files.
            </li>
            <li className="flex gap-2">
              <Check size={16} strokeWidth={2} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
              7-day money back guarantee.
            </li>
            <li className="flex gap-2">
              <Check size={16} strokeWidth={2} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
              Advanced permissions.
            </li>
          </ul>
        </div>

        <div className="grid gap-2">
          <Button
            type="button"
            className="w-full"
            onClick={handleChangePlan}
            disabled={selectedPlan === "2" && !isCardAdded}
          >
            {selectedPlan === currentPlan ? "Confirm Plan" : "Change Plan"}
          </Button>
          {selectedPlan === "2" && !isCardAdded && (
            <p className="text-red-500 text-sm">Please add a card before changing to the Premium plan.</p>
          )}
        </div>
      </form>
    </div>
  )
}

