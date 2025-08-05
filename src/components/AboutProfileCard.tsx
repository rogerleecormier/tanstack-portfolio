import { ProfileCard } from "./ProfileCard"

export function AboutProfileCard() {
  return (
    <ProfileCard
      name="Roger Lee Cormier"
      title="Technical Project Manager & U.S. Army Veteran"
      description="PMP-certified Technical Project Manager specializing in cloud platforms, SaaS ecosystems, and operational strategy. I modernize legacy systems, integrate enterprise tools, and align cross-functional teams around systems thinking and practical execution."
      imageUrl="https://www.rcormier.dev/assets/images/IMG_1242.JPG"
      imageAlt="Roger Lee Cormier - Technical Program Manager"
      badges={[
        { text: "PMP Certified", className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
        { text: "U.S. Army NCO", className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
        { text: "Cloud & DevOps", className: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200" },
        { text: "ERP Integration", className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" }
      ]}
    />
  )
}