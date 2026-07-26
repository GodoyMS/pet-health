import React, { useEffect, useId, useState } from "react";



import {

  Button,

  DatePicker,

  Dialog,

  DialogContent,

  DialogDescription,

  DialogHeader,

  DialogTitle,

  DialogTrigger,

  FieldGroup,

  Icon,

  Input,

  Label,

  Select,

  SelectContent,

  SelectItem,

  SelectTrigger,

  SelectValue,

  Textarea,

  toast

} from "@repo/ui";



import type { HealthLogDraft } from "./types";



const RATING_OPTIONS = [1, 2, 3, 4, 5] as const;



function todayIsoDate(): string {

  const d = new Date();

  const y = d.getFullYear();

  const m = String(d.getMonth() + 1).padStart(2, "0");

  const day = String(d.getDate()).padStart(2, "0");

  return `${y}-${m}-${day}`;

}



export type AddHealthLogDialogProps = {

  trigger: React.ReactNode;

  onAdd: (draft: HealthLogDraft) => Promise<void>;

  isSubmitting?: boolean;

};



export function AddHealthLogDialog({ trigger, onAdd, isSubmitting = false }: AddHealthLogDialogProps) {

  const formId = useId();

  const [open, setOpen] = useState(false);



  const [date, setDate] = useState(todayIsoDate);

  const [weight, setWeight] = useState("");

  const [appetite, setAppetite] = useState<string>("3");

  const [energy, setEnergy] = useState<string>("3");

  const [mood, setMood] = useState<string>("3");

  const [notes, setNotes] = useState("");



  useEffect(() => {

    if (!open) return;

    setDate(todayIsoDate());

    setWeight("");

    setAppetite("3");

    setEnergy("3");

    setMood("3");

    setNotes("");

  }, [open]);



  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();

    const w = Number.parseFloat(weight.replace(",", "."));

    if (!date || Number.isNaN(w)) return;



    try {

      await onAdd({

        date,

        weightKg: w,

        appetite: Number(appetite) as HealthLogDraft["appetite"],

        energy: Number(energy) as HealthLogDraft["energy"],

        mood: Number(mood) as HealthLogDraft["mood"],

        notes: notes.trim()

      });

      setOpen(false);

      toast.success("Health log saved");

    } catch {

      toast.error("Could not save health log. Please try again.");

    }

  };



  const weightOk = weight.trim().length > 0 && !Number.isNaN(Number.parseFloat(weight.replace(",", ".")));



  return (

    <Dialog open={open} onOpenChange={setOpen}>

      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent className="sm:max-w-lg">

        <DialogHeader>

          <DialogTitle>New health log</DialogTitle>

          <DialogDescription className="text-left">

            Record a daily check-in with weight, appetite, energy, and mood.

          </DialogDescription>

        </DialogHeader>

        <form id={formId} onSubmit={handleSubmit} className="flex flex-col gap-4">

          <FieldGroup className="gap-4">

            <div className="grid gap-2">

              <Label htmlFor={`${formId}-date`}>Date</Label>

              <DatePicker value={date} onChange={setDate} />

            </div>

            <div className="grid gap-2">

              <Label htmlFor={`${formId}-weight`}>Weight (kg)</Label>

              <Input

                id={`${formId}-weight`}

                inputMode="decimal"

                placeholder="e.g. 12.5"

                value={weight}

                onChange={(ev) => setWeight(ev.target.value)}

                required

              />

            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

              <div className="grid gap-2">

                <Label>Appetite (1–5)</Label>

                <Select value={appetite} onValueChange={setAppetite}>

                  <SelectTrigger aria-label="Appetite rating">

                    <SelectValue placeholder="Rating" />

                  </SelectTrigger>

                  <SelectContent>

                    {RATING_OPTIONS.map((n) => (

                      <SelectItem key={n} value={String(n)}>

                        {n}

                      </SelectItem>

                    ))}

                  </SelectContent>

                </Select>

              </div>

              <div className="grid gap-2">

                <Label>Energy (1–5)</Label>

                <Select value={energy} onValueChange={setEnergy}>

                  <SelectTrigger aria-label="Energy rating">

                    <SelectValue placeholder="Rating" />

                  </SelectTrigger>

                  <SelectContent>

                    {RATING_OPTIONS.map((n) => (

                      <SelectItem key={n} value={String(n)}>

                        {n}

                      </SelectItem>

                    ))}

                  </SelectContent>

                </Select>

              </div>

              <div className="grid gap-2">

                <Label>Mood (1–5)</Label>

                <Select value={mood} onValueChange={setMood}>

                  <SelectTrigger aria-label="Mood rating">

                    <SelectValue placeholder="Rating" />

                  </SelectTrigger>

                  <SelectContent>

                    {RATING_OPTIONS.map((n) => (

                      <SelectItem key={n} value={String(n)}>

                        {n}

                      </SelectItem>

                    ))}

                  </SelectContent>

                </Select>

              </div>

            </div>

            <div className="grid gap-2">

              <Label htmlFor={`${formId}-notes`}>Notes</Label>

              <Textarea

                id={`${formId}-notes`}

                placeholder="Optional observations…"

                value={notes}

                onChange={(ev) => setNotes(ev.target.value)}

                rows={4}

                className="resize-y min-h-[88px]"

              />

            </div>

          </FieldGroup>

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">

            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>

              Cancel

            </Button>

            <Button type="submit" disabled={!date || !weightOk || isSubmitting}>

              <Icon name="add" className="mr-1.5 size-4" aria-hidden />

              {isSubmitting ? "Saving…" : "Add log"}

            </Button>

          </div>

        </form>

      </DialogContent>

    </Dialog>

  );

}

