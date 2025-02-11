"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog"
import { Label } from "./ui/label"
import { RadioGroup, RadioGroupItem } from "./ui/radio-group"
import { Check } from "lucide-react"
import { useId } from "react"
import { UpdateCardDialog } from "./update-card-dialog"

export function PlanUpgradeDialog({ isDisabled }: { isDisabled: boolean }) {
  const id = useId()
  const [selectedPlan, setSelectedPlan] = useState("1")
  const [showUpdateCard, setShowUpdateCard] = useState(false)
  const [showPlanUpgrade, setShowPlanUpgrade] = useState(false)

  const handleChangePlan = () => {
    if (selectedPlan === "2") {
      setShowUpdateCard(true)
      setShowPlanUpgrade(false)
    } else {
      // Handle standard plan selection
      console.log("Standard plan selected")
    }
  }

  const handleCancelCardUpdate = () => {
    setShowUpdateCard(false)
    setShowPlanUpgrade(true)
  }

  return (
    <>
      <Dialog open={showPlanUpgrade} onOpenChange={setShowPlanUpgrade}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full" onClick={() => setShowPlanUpgrade(true)} disabled={isDisabled}>
            Upgrade plan
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Change your plan</DialogTitle>
            <DialogDescription className="text-left">Pick one of the following plans.</DialogDescription>
          </DialogHeader>

          <form className="space-y-5">
            <RadioGroup className="gap-2" defaultValue="1" onValueChange={setSelectedPlan}>
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
              <Button type="button" className="w-full" onClick={handleChangePlan}>
                Change plan
              </Button>
              <DialogClose asChild>
                <Button type="button" variant="ghost" className="w-full">
                  Cancel
                </Button>
              </DialogClose>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <UpdateCardDialog
        isOpen={showUpdateCard}
        onClose={() => setShowUpdateCard(false)}
        onCancel={handleCancelCardUpdate}
      />
    </>
  )
}

