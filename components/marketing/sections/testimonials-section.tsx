"use client";

import { cn } from "@/lib/utils";

interface Testimonial {
	name: string;
	role: string;
	company: string;
	quote: string;
	avatar: string;
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
	return (
		<figure className="flex flex-col justify-between gap-10 rounded-md bg-marketing-card p-6 text-sm">
			<blockquote className="flex flex-col gap-4">
				<p className="line-clamp-2 text-pretty">"{testimonial.quote}"</p>
			</blockquote>
			<figcaption className="flex items-center gap-4">
				<div className="flex size-12 overflow-hidden rounded-full outline -outline-offset-1 outline-black/5 dark:outline-white/5">
					<img
						src={testimonial.avatar}
						alt={testimonial.name}
						width={160}
						height={160}
						className="size-full object-cover bg-white/75 dark:bg-black/75"
					/>
				</div>
				<div>
					<p className="font-semibold text-marketing-fg">{testimonial.name}</p>
					<p className="text-marketing-fg-muted">
						{testimonial.role} at {testimonial.company}
					</p>
				</div>
			</figcaption>
		</figure>
	);
}

export function TestimonialsSection() {
	const testimonials: Testimonial[] = [
		{
			name: "Michael Turner",
			role: "CEO",
			company: "Turner Roofing",
			quote: "Huge value for free—the tools and guides genuinely help.",
			avatar: "/marketing/avatars/man-32.jpg",
		},
		{
			name: "Sarah Collins",
			role: "Marketing Assistant",
			company: "Blue Harbor Dental",
			quote:
				"I feared accessibility lawsuits. DAPEN's support and community gave me confidence.",
			avatar: "/marketing/avatars/woman-44.jpg",
		},
		{
			name: "David Ramirez",
			role: "Website Manager",
			company: "Green Valley",
			quote:
				"I've used paid widgets—the DAPEN Toolbar matches them, and it's free.",
			avatar: "/marketing/avatars/man-75.jpg",
		},
		{
			name: "Jessica Brown",
			role: "CEO",
			company: "Brown Consulting",
			quote:
				"The team really understands accessibility—clear, detailed resources.",
			avatar: "/marketing/avatars/woman-68.jpg",
		},
		{
			name: "Kevin Patel",
			role: "Website Manager",
			company: "Silver Oak Finance",
			quote: "Support replied fast—and helped me actually understand.",
			avatar: "/marketing/avatars/man-46.jpg",
		},
		{
			name: "Emily Johnson",
			role: "Marketing Assistant",
			company: "Westside Auto",
			quote:
				"I knew nothing about accessibility before DAPEN. Now it's manageable.",
			avatar: "/marketing/avatars/woman-26.jpg",
		},
	];

	return (
		<section id="testimonials" className="py-16">
			<div className="mx-auto flex max-w-2xl flex-col gap-10 px-6 md:max-w-3xl lg:max-w-7xl lg:gap-16 lg:px-10">
				{/* Header */}
				<div className="flex max-w-2xl flex-col gap-6">
					<div className="flex flex-col gap-2">
						<h2
							className={cn(
								"text-pretty font-display text-[2rem] leading-10 tracking-tight",
								"text-marketing-fg",
								"sm:text-5xl sm:leading-14",
							)}
						>
							Business owners feel protected
						</h2>
					</div>
					<div className="text-base leading-7 text-marketing-fg-muted text-pretty">
						<p>See why teams love our tools and resources.</p>
					</div>
				</div>

				{/* Testimonials Grid */}
				<div>
					<div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
						{testimonials.map((testimonial) => (
							<TestimonialCard
								key={testimonial.name}
								testimonial={testimonial}
							/>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}
