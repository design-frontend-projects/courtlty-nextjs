"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Pencil, Trash2, Clock } from "lucide-react";

interface AvailabilitySlot {
  id: string;
  court_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

interface CourtAvailabilityManagerProps {
  courtId: string;
  initialData?: AvailabilitySlot[];
}

const DAYS_OF_WEEK = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

export default function CourtAvailabilityManager({
  courtId,
  initialData = [],
}: CourtAvailabilityManagerProps) {
  const [slots, setSlots] = useState<AvailabilitySlot[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<AvailabilitySlot | null>(null);

  // Form state
  const [dayOfWeek, setDayOfWeek] = useState<number>(1);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [isAvailable, setIsAvailable] = useState(true);

  const fetchSlots = useCallback(async () => {
    try {
      const res = await fetch(`/api/courts/${courtId}/availability`);
      const data = await res.json();
      if (res.ok) {
        setSlots(data.availability || []);
      }
    } catch (error) {
      console.error("Failed to fetch availability:", error);
    }
  }, [courtId]);

  useEffect(() => {
    if (!initialData.length && courtId) {
      fetchSlots();
    }
  }, [courtId, initialData.length, fetchSlots]);

  const resetForm = () => {
    setDayOfWeek(1);
    setStartTime("09:00");
    setEndTime("17:00");
    setIsAvailable(true);
    setEditingSlot(null);
  };

  const openEditDialog = (slot: AvailabilitySlot) => {
    setEditingSlot(slot);
    setDayOfWeek(slot.day_of_week);
    setStartTime(slot.start_time.slice(0, 5));
    setEndTime(slot.end_time.slice(0, 5));
    setIsAvailable(slot.is_available);
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (startTime >= endTime) {
      toast.error("End time must be after start time");
      return;
    }

    setLoading(true);
    try {
      const url = `/api/courts/${courtId}/availability`;
      const method = editingSlot ? "PUT" : "POST";
      const body = editingSlot
        ? {
            availability_id: editingSlot.id,
            day_of_week: dayOfWeek,
            start_time: startTime,
            end_time: endTime,
            is_available: isAvailable,
          }
        : {
            day_of_week: dayOfWeek,
            start_time: startTime,
            end_time: endTime,
            is_available: isAvailable,
          };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save availability");
      }

      toast.success(
        editingSlot ? "Availability updated!" : "Availability added!",
      );
      setDialogOpen(false);
      resetForm();
      fetchSlots();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (slotId: string) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/courts/${courtId}/availability?availability_id=${slotId}`,
        { method: "DELETE" },
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete");
      }

      toast.success("Availability slot deleted");
      setSlots(slots.filter((s) => s.id !== slotId));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const groupedSlots = DAYS_OF_WEEK.map((day) => ({
    ...day,
    slots: slots.filter((s) => s.day_of_week === day.value),
  }));

  return (
    <Card className="border-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Court Availability
            </CardTitle>
            <CardDescription>
              Manage when this court is available for booking
            </CardDescription>
          </div>
          <Dialog
            open={dialogOpen}
            onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) resetForm();
            }}
          >
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Slot
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingSlot ? "Edit Availability" : "Add Availability Slot"}
                </DialogTitle>
                <DialogDescription>
                  Set the time range when the court is available
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Day of Week</Label>
                  <Select
                    value={dayOfWeek.toString()}
                    onValueChange={(v) => setDayOfWeek(parseInt(v))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DAYS_OF_WEEK.map((day) => (
                        <SelectItem
                          key={day.value}
                          value={day.value.toString()}
                        >
                          {day.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_time">Start Time</Label>
                    <Input
                      id="start_time"
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end_time">End Time</Label>
                    <Input
                      id="end_time"
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label>Available for Booking</Label>
                    <p className="text-sm text-muted-foreground">
                      Toggle off to mark as unavailable
                    </p>
                  </div>
                  <Switch
                    checked={isAvailable}
                    onCheckedChange={setIsAvailable}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingSlot ? "Save Changes" : "Add Slot"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        {slots.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>No availability slots configured</p>
            <p className="text-sm">
              Add slots to define when the court is open
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {groupedSlots
              .filter((day) => day.slots.length > 0)
              .map((day) => (
                <div key={day.value} className="space-y-2">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                    {day.label}
                  </h4>
                  <div className="space-y-2">
                    {day.slots.map((slot) => (
                      <div
                        key={slot.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border"
                      >
                        <div className="flex items-center gap-3">
                          <Badge
                            variant={
                              slot.is_available ? "default" : "secondary"
                            }
                            className={
                              slot.is_available
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                                : "bg-gray-100 text-gray-600"
                            }
                          >
                            {slot.is_available ? "Open" : "Closed"}
                          </Badge>
                          <span className="font-mono text-sm">
                            {slot.start_time.slice(0, 5)} -{" "}
                            {slot.end_time.slice(0, 5)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(slot)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete Slot?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently remove this availability
                                  slot.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(slot.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
