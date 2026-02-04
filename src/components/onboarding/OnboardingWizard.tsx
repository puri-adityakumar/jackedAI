"use client";

import { cn } from "@/lib/utils";
import { useMutation } from "convex/react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Dumbbell,
  Scale,
  Target,
  User,
} from "lucide-react";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";

interface OnboardingWizardProps {
  onComplete: () => void;
}

type FitnessGoal = "lose_weight" | "build_muscle" | "maintain";

interface FormData {
  name: string;
  height: number | "";
  weight: number | "";
  age: number | "";
  fitnessGoal: FitnessGoal | "";
  dailyCalorieTarget: number | "";
}

const STEPS = [
  { id: 1, title: "Welcome", icon: User },
  { id: 2, title: "Body Stats", icon: Scale },
  { id: 3, title: "Goal", icon: Target },
  { id: 4, title: "Calories", icon: Dumbbell },
];

function calculateCalories(
  weight: number,
  height: number,
  age: number,
  goal: FitnessGoal
): number {
  // Basic BMR calculation using Mifflin-St Jeor equation (assuming male for simplicity)
  const bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  // Assume moderate activity level (1.55 multiplier)
  const tdee = bmr * 1.55;

  switch (goal) {
    case "lose_weight":
      return Math.round(tdee - 500); // 500 calorie deficit
    case "build_muscle":
      return Math.round(tdee + 300); // 300 calorie surplus
    case "maintain":
    default:
      return Math.round(tdee);
  }
}

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    height: "",
    weight: "",
    age: "",
    fitnessGoal: "",
    dailyCalorieTarget: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createProfile = useMutation(api.userProfile.create);

  const updateField = <K extends keyof FormData>(
    field: K,
    value: FormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.name.trim().length > 0;
      case 2:
        return (
          formData.height !== "" &&
          formData.weight !== "" &&
          formData.height > 0 &&
          formData.weight > 0
        );
      case 3:
        return formData.fitnessGoal !== "";
      case 4:
        return formData.dailyCalorieTarget !== "" && formData.dailyCalorieTarget > 0;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (step === 3 && formData.dailyCalorieTarget === "") {
      // Auto-calculate calorie target when moving to step 4
      const calculated = calculateCalories(
        formData.weight as number,
        formData.height as number,
        (formData.age as number) || 30,
        formData.fitnessGoal as FitnessGoal
      );
      updateField("dailyCalorieTarget", calculated);
    }
    setStep((s) => Math.min(s + 1, 4));
  };

  const handleBack = () => {
    setStep((s) => Math.max(s - 1, 1));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await createProfile({
        name: formData.name,
        height: formData.height as number,
        weight: formData.weight as number,
        age: formData.age !== "" ? (formData.age as number) : undefined,
        fitnessGoal: formData.fitnessGoal as FitnessGoal,
        dailyCalorieTarget: formData.dailyCalorieTarget as number,
      });
      onComplete();
    } catch (error) {
      console.error("Error creating profile:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        {/* Progress indicator */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                    step >= s.id
                      ? "bg-green-600 text-white"
                      : "bg-gray-200 text-gray-500"
                  )}
                >
                  {step > s.id ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <s.icon className="w-5 h-5" />
                  )}
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={cn(
                      "w-8 h-1 mx-1",
                      step > s.id ? "bg-green-600" : "bg-gray-200"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Welcome */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Dumbbell className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Welcome to JackedAI
                </h2>
                <p className="text-gray-500 mt-2">
                  Your AI-powered fitness companion. Let&apos;s set up your profile.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What&apos;s your name?
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  autoFocus
                />
              </div>
            </div>
          )}

          {/* Step 2: Body Stats */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900">Body Stats</h2>
                <p className="text-gray-500 mt-2">
                  Help us personalize your experience
                </p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    value={formData.height}
                    onChange={(e) =>
                      updateField("height", e.target.value ? Number(e.target.value) : "")
                    }
                    placeholder="175"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    value={formData.weight}
                    onChange={(e) =>
                      updateField("weight", e.target.value ? Number(e.target.value) : "")
                    }
                    placeholder="70"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Age (optional)
                  </label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) =>
                      updateField("age", e.target.value ? Number(e.target.value) : "")
                    }
                    placeholder="25"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Fitness Goal */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  What&apos;s Your Goal?
                </h2>
                <p className="text-gray-500 mt-2">
                  We&apos;ll customize your calorie targets
                </p>
              </div>
              <div className="space-y-3">
                {[
                  {
                    id: "lose_weight",
                    label: "Lose Weight",
                    desc: "Calorie deficit for fat loss",
                    icon: "🔥",
                  },
                  {
                    id: "build_muscle",
                    label: "Build Muscle",
                    desc: "Calorie surplus for gains",
                    icon: "💪",
                  },
                  {
                    id: "maintain",
                    label: "Maintain",
                    desc: "Stay at your current weight",
                    icon: "⚖️",
                  },
                ].map((goal) => (
                  <button
                    key={goal.id}
                    onClick={() =>
                      updateField("fitnessGoal", goal.id as FitnessGoal)
                    }
                    className={cn(
                      "w-full p-4 rounded-lg border-2 text-left transition-all",
                      formData.fitnessGoal === goal.id
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{goal.icon}</span>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {goal.label}
                        </p>
                        <p className="text-sm text-gray-500">{goal.desc}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Calorie Target */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  Daily Calorie Target
                </h2>
                <p className="text-gray-500 mt-2">
                  We&apos;ve calculated a recommendation based on your stats
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-6 text-center">
                <p className="text-sm text-green-600 font-medium">
                  Recommended
                </p>
                <input
                  type="number"
                  value={formData.dailyCalorieTarget}
                  onChange={(e) =>
                    updateField(
                      "dailyCalorieTarget",
                      e.target.value ? Number(e.target.value) : ""
                    )
                  }
                  className="text-4xl font-bold text-green-700 bg-transparent text-center w-full outline-none"
                />
                <p className="text-green-600">calories/day</p>
              </div>
              <p className="text-sm text-gray-500 text-center">
                You can adjust this anytime in settings
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className={cn(
                "flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors",
                canProceed()
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              )}
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canProceed() || isSubmitting}
              className={cn(
                "flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors",
                canProceed() && !isSubmitting
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              )}
            >
              {isSubmitting ? "Creating..." : "Get Started"}
              <Check className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
