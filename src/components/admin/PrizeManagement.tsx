"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { prizeSchema } from "@/lib/validations/schemas";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Loader2, Trash2, Plus, Gift } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type Prize = {
  id: string;
  name: string;
  description: string;
  points_cost: number;
  image_url?: string;
  quantity: number;
  is_active: boolean;
};

type PrizeFormValues = z.infer<typeof prizeSchema>;

export default function PrizeManagement() {
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PrizeFormValues>({
    resolver: zodResolver(prizeSchema),
    defaultValues: {
      name: "",
      description: "",
      points_cost: 0,
      image_url: "",
      quantity: 1,
      is_active: true,
    },
  });

  useEffect(() => {
    fetchPrizes();
  }, []);

  const fetchPrizes = async () => {
    try {
      const response = await fetch("/api/prizes");
      if (!response.ok) throw new Error("Failed to fetch prizes");
      const data = await response.json();
      // Ensure API returns array under 'prizes' key or directly
      // Adjust based on your API response structure.
      // Assuming array for now based on GET /api/prizes returning `NextResponse.json(prizes)` directly:
      // If API returns { prizes: [...] } adjust accordingly.
      // Based on my review of route.ts, it returns plain array `NextResponse.json(prizes)`.
      // BUT GET /api/bookings returns { bookings: data }.
      // Let's check route.ts line 22: `return NextResponse.json(prizes);` -> It is an array.
      // My previous code expected `data.prizes`. I need to fix that too.
      setPrizes(Array.isArray(data) ? data : data.prizes || []);
    } catch (error) {
      toast.error("Error fetching prizes");
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (values: PrizeFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/prizes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) throw new Error("Failed to create prize");

      toast.success("Prize created successfully");
      form.reset();
      fetchPrizes();
    } catch (error) {
      toast.error("Error creating prize");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this prize?")) return;

    try {
      const response = await fetch(`/api/prizes/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete prize");

      toast.success("Prize deleted");
      setPrizes(prizes.filter((p) => p.id !== id));
    } catch (error) {
      toast.error("Error deleting prize");
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card className="md:col-span-1 lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Prize
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                {...form.register("name")}
                placeholder="e.g. Premium Racket"
              />
              {form.formState.errors.name && (
                <p className="text-xs text-red-500">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                {...form.register("description")}
                placeholder="Prize details..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Points Cost</label>
                <Input
                  type="number"
                  {...form.register("points_cost", { valueAsNumber: true })}
                />
                {form.formState.errors.points_cost && (
                  <p className="text-xs text-red-500">
                    {form.formState.errors.points_cost.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Quantity</label>
                <Input
                  type="number"
                  {...form.register("quantity", { valueAsNumber: true })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Image URL</label>
              <Input
                {...form.register("image_url")}
                placeholder="https://..."
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Create Prize"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="md:col-span-1 lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Current Prizes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Points</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prizes.map((prize) => (
                  <TableRow key={prize.id}>
                    <TableCell>
                      {prize.image_url ? (
                        <img
                          src={prize.image_url}
                          alt={prize.name}
                          className="h-10 w-10 rounded-md object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                          <Gift className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{prize.name}</TableCell>
                    <TableCell>{prize.points_cost}</TableCell>
                    <TableCell>{prize.quantity}</TableCell>
                    <TableCell>
                      <Badge
                        variant={prize.is_active ? "default" : "secondary"}
                      >
                        {prize.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(prize.id)}
                        className="text-red-500 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {prizes.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-muted-foreground"
                    >
                      No prizes found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
