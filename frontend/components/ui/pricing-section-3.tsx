"use client";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { TimelineContent } from "@/components/ui/timeline-animation";
import {VerticalCutReveal} from "@/components/ui/vertical-cut-reveal";
import { cn } from "@/lib/utils";
import NumberFlow from "@number-flow/react";
import { Briefcase, CheckCheck, Database, Server } from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";

const plans = [
  {
    name: "Starter",
    description:
      "Perfect for individual developers getting started with AI-powered insights",
    price: 9,
    yearlyPrice: 79,
    buttonText: "Get started",
    buttonVariant: "outline" as const,
    features: [
      { text: "Up to 5 repositories", icon: <Briefcase size={20} /> },
      { text: "Basic analytics dashboard", icon: <Database size={20} /> },
      { text: "Weekly insights reports", icon: <Server size={20} /> },
    ],
    includes: [
      "Free includes:",
      "GitHub integration",
      "Basic health scoring",
      "Email notifications",
    ],
  },
  {
    name: "Professional",
    description:
      "Best for growing teams that need advanced developer intelligence",
    price: 29,
    yearlyPrice: 249,
    buttonText: "Get started",
    buttonVariant: "outline" as const,
    features: [
      { text: "Unlimited repositories", icon: <Briefcase size={20} /> },
      { text: "Advanced analytics", icon: <Database size={20} /> },
      { text: "Real-time insights", icon: <Server size={20} /> },
    ],
    includes: [
      "Everything in Starter, plus:",
      "Team collaboration tools",
      "Custom metrics tracking",
      "Priority support",
    ],
  },
  {
    name: "Enterprise",
    description:
      "Advanced plan with enhanced security and unlimited access for large teams",
    price: 99,
    yearlyPrice: 899,
    popular: true,
    buttonText: "Get started",
    buttonVariant: "default" as const,
    features: [
      { text: "Enterprise-grade security", icon: <Briefcase size={20} /> },
      { text: "Unlimited everything", icon: <Database size={20} /> },
      { text: "24/7 dedicated support", icon: <Server size={20} /> },
    ],
    includes: [
      "Everything in Professional, plus:",
      "SSO integration",
      "Custom integrations",
      "Dedicated account manager",
    ],
  },
];

const PricingSwitch = ({
  onSwitch,
  className,
}: {
  onSwitch: (value: string) => void;
  className?: string;
}) => {
  const [selected, setSelected] = useState("0");

  const handleSwitch = (value: string) => {
    setSelected(value);
    onSwitch(value);
  };

  return (
    <div className={cn("flex justify-center", className)}>
      <div className="relative z-10 mx-auto flex w-fit rounded-full bg-neutral-50 border border-gray-200 p-1">
        <button
          onClick={() => handleSwitch("0")}
          className={cn(
            "relative z-10 w-fit sm:h-12 cursor-pointer h-10  rounded-full sm:px-6 px-3 sm:py-2 py-1 font-medium transition-colors",
            selected === "0"
              ? "text-black"
              : "text-muted-foreground hover:text-black",
          )}
        >
          {selected === "0" && (
            <motion.span
              layoutId={"switch"}
              className="absolute top-0 left-0 sm:h-12 h-10 w-full rounded-full border-4 shadow-sm shadow-neutral-300 border-neutral-300 bg-gradient-to-t from-neutral-100 via-neutral-200 to-neutral-300"
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
          <span className="relative">Monthly</span>
        </button>

        <button
          onClick={() => handleSwitch("1")}
          className={cn(
            "relative z-10 w-fit cursor-pointer sm:h-12 h-10 flex-shrink-0 rounded-full sm:px-6 px-3 sm:py-2 py-1 font-medium transition-colors",
            selected === "1"
              ? "text-black"
              : "text-muted-foreground hover:text-black",
          )}
        >
          {selected === "1" && (
            <motion.span
              layoutId={"switch"}
              className="absolute top-0 left-0 sm:h-12 h-10  w-full  rounded-full border-4 shadow-sm shadow-neutral-300 border-neutral-300 bg-gradient-to-t from-neutral-100 via-neutral-200 to-neutral-300"
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
          <span className="relative flex items-center gap-2">
            Yearly
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-black">
              Save 20%
            </span>
          </span>
        </button>
      </div>
    </div>
  );
};

export default function PricingSection() {
  const [isYearly, setIsYearly] = useState(false);
  const pricingRef = useRef<HTMLDivElement>(null);

  const revealVariants = {
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        delay: i * 0.4,
        duration: 0.5,
      },
    }),
    hidden: {
      filter: "blur(10px)",
      y: -20,
      opacity: 0,
    },
  };

  const togglePricingPeriod = (value: string) =>
    setIsYearly(Number.parseInt(value) === 1);

  return (
    <div
      className="px-4 pt-20 min-h-screen w-full mx-auto relative"
      ref={pricingRef}
    >
      <article className="flex sm:flex-row flex-col sm:pb-0 pb-4 sm:items-center items-start justify-between mb-12">
        <div className="text-left mb-6">
          <h2 className="text-4xl font-medium leading-[130%] text-gray-900 mb-4">
            <VerticalCutReveal
              splitBy="words"
              staggerDuration={0.15}
              staggerFrom="first"
              reverse={true}
              containerClassName="justify-start"
              transition={{
                type: "spring",
                stiffness: 250,
                damping: 40,
                delay: 0, // First element
              }}
            >
              Plans & Pricing
            </VerticalCutReveal>
          </h2>

          <TimelineContent
            as="p"
            animationNum={0}
            timelineRef={pricingRef}
            customVariants={revealVariants}
            className="text-gray-600 w-[80%]"
          >
            Choose the perfect plan for your development team. Get actionable insights 
            and boost your productivity with DevPulse.
          </TimelineContent>
        </div>

        <TimelineContent
          as="div"
          animationNum={1}
          timelineRef={pricingRef}
          customVariants={revealVariants}
        >
          <PricingSwitch onSwitch={togglePricingPeriod} className="shrink-0" />
        </TimelineContent>
      </article>

      <TimelineContent
        as="div"
        animationNum={2}
        timelineRef={pricingRef}
        customVariants={revealVariants}
        className="w-full max-w-7xl mx-auto"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={`relative flex flex-col justify-between h-full w-full rounded-lg p-6 ${
                plan.popular
                  ? "ring-2 ring-neutral-900 bg-gradient-to-t from-black to-neutral-900 text-white transform scale-105 shadow-2xl"
                  : "border border-gray-200 bg-white text-gray-900 shadow-sm"
              }`}
            >
              <div className="flex-1">
                <div className="space-y-2 pb-3">
                  {plan.popular && (
                    <div className="pb-4">
                      <span className="bg-neutral-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                        Popular
                      </span>
                    </div>
                  )}

                  <div className="flex items-baseline">
                    <span className={`text-4xl font-semibold ${
                      plan.popular ? "text-white" : "text-gray-900"
                    }`}>
                      $
                      <NumberFlow
                        format={{
                          currency: "USD",
                        }}
                        value={isYearly ? plan.yearlyPrice : plan.price}
                        className={`text-4xl font-semibold ${
                          plan.popular ? "text-white" : "text-gray-900"
                        }`}
                      />
                    </span>
                    <span
                      className={
                        plan.popular
                          ? "text-neutral-200 ml-1"
                          : "text-gray-600 ml-1"
                      }
                    >
                      /{isYearly ? "year" : "month"}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between">
                  <h3 className={`text-3xl font-semibold mb-2 ${
                    plan.popular ? "text-white" : "text-gray-900"
                  }`}>{plan.name}</h3>
                </div>
                <p
                  className={
                    plan.popular
                      ? "text-sm text-neutral-200 mb-4"
                      : "text-sm text-gray-600 mb-4"
                  }
                >
                  {plan.description}
                </p>

                <div className={`space-y-3 pt-4 border-t ${
                  plan.popular ? "border-neutral-600" : "border-neutral-200"
                }`}>
                  <h4 className={`font-medium text-base mb-3 ${
                    plan.popular ? "text-white" : "text-gray-900"
                  }`}>
                    {plan.includes[0]}
                  </h4>
                  <ul className="space-y-2 font-semibold">
                    {plan.includes.slice(1).map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <span
                          className={
                            plan.popular
                              ? "text-white h-6 w-6 bg-neutral-600 border border-neutral-500 rounded-full grid place-content-center mt-0.5 mr-3"
                              : "text-black h-6 w-6 bg-white border border-black rounded-full grid place-content-center mt-0.5 mr-3"
                          }
                        >
                          <CheckCheck className="h-4 w-4  " />
                        </span>
                        <span
                          className={
                            plan.popular
                              ? "text-sm text-neutral-100"
                              : "text-sm text-gray-600"
                          }
                        >
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="mt-6">
                <button
                  className={`w-full p-4 text-xl rounded-xl ${
                    plan.popular
                      ? "bg-gradient-to-t from-neutral-100 to-neutral-300 font-semibold shadow-lg shadow-neutral-500 border border-neutral-400 text-black"
                      : plan.buttonVariant === "outline"
                        ? "bg-gradient-to-t from-neutral-900 to-neutral-600  shadow-lg shadow-neutral-900 border border-neutral-700 text-white"
                        : ""
                  }`}
                >
                  {plan.buttonText}
                </button>
              </div>
            </div>
          ))}
        </div>
      </TimelineContent>
    </div>
  );
}
