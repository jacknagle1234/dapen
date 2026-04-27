"use client";

import NiceModal, { type NiceModalHocProps } from "@ebay/nice-modal-react";
import { toast } from "sonner";
import { z } from "zod/v4";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useEnhancedModal } from "@/hooks/use-enhanced-modal";
import { useZodForm } from "@/hooks/use-zod-form";
import { trpc } from "@/trpc/client";

const inviteOwnerSchema = z.object({
	email: z.string().email("Enter a valid email address"),
});

export type InviteOwnerModalProps = NiceModalHocProps & {
	organizationId: string;
	organizationName: string;
};

export const InviteOwnerModal = NiceModal.create(
	({ organizationId, organizationName }: InviteOwnerModalProps) => {
		const modal = useEnhancedModal();
		const utils = trpc.useUtils();
		const inviteContactOwner =
			trpc.admin.organization.inviteContactOwner.useMutation();

		const form = useZodForm({
			schema: inviteOwnerSchema,
			defaultValues: { email: "" },
		});

		const onSubmit = form.handleSubmit(async ({ email }) => {
			try {
				await inviteContactOwner.mutateAsync({
					email,
					organizationId,
				});

				toast.success("Invitation sent.");
				form.reset({ email: "" });
				void utils.admin.organization.listMyContacts.invalidate();
				modal.handleClose();
			} catch (err) {
				const message =
					err && typeof err === "object" && "message" in err
						? String((err as { message: unknown }).message)
						: "Something went wrong. Please try again.";
				toast.error(message);
			}
		});

		return (
			<Dialog open={modal.visible}>
				<DialogContent
					className="sm:max-w-md"
					onClose={modal.handleClose}
					onAnimationEndCapture={modal.handleAnimationEndCapture}
				>
					<DialogHeader>
						<DialogTitle>Invite owner</DialogTitle>
						<DialogDescription>
							Send an invitation to become the organization owner of{" "}
							<strong>{organizationName}</strong>. They will receive the same
							email and signup flow as invites from organization settings.
						</DialogDescription>
					</DialogHeader>
					<Form {...form}>
						<form onSubmit={onSubmit} className="space-y-4">
							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Email</FormLabel>
										<FormControl>
											<Input
												type="email"
												autoComplete="email"
												placeholder="owner@example.com"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<DialogFooter className="gap-2 sm:gap-0">
								<Button
									type="button"
									variant="outline"
									onClick={modal.handleClose}
								>
									Cancel
								</Button>
								<Button
									type="submit"
									disabled={
										form.formState.isSubmitting || inviteContactOwner.isPending
									}
								>
									{form.formState.isSubmitting || inviteContactOwner.isPending
										? "Sending…"
										: "Send invite"}
								</Button>
							</DialogFooter>
						</form>
					</Form>
				</DialogContent>
			</Dialog>
		);
	},
);
