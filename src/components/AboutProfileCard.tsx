import { ProfileCard } from "./ProfileCard"

export function AboutProfileCard() {
  return (
    <ProfileCard
      name="Roger Lee Cormier"
      title="Technical Project Manager & U.S. Army Veteran"
      description="PMP-certified Technical Project Manager specializing in cloud platforms, SaaS ecosystems, and operational strategy. I modernize legacy systems, integrate enterprise tools, and align cross-functional teams around systems thinking and practical execution."
      imageUrl="/images/IMG_1242.JPG"
      imageAlt="Roger Lee Cormier - Technical Program Manager"
      badges={[
        { text: "PMP Certified", className: "brand-bg-secondary text-blue-800 dark:bg-blue-50 dark:text-blue-800" },
        { text: "U.S. Army NCO", className: "bg-green-100 text-green-800 dark:bg-green-50 dark:text-green-800" },
        { text: "Cloud & DevOps", className: "bg-orange-100 text-orange-800 dark:bg-orange-50 dark:text-orange-800" },
        { text: "ERP Integration", className: "bg-red-100 text-red-800 dark:bg-red-50 dark:text-red-800" }
      ]}
    />
  )
}