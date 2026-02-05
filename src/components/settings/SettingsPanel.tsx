"use client";

import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "convex/react";
import {
  Calculator,
  ChevronDown,
  ChevronUp,
  Loader2,
  Moon,
  Save,
  Sun,
  User,
  Monitor,
} from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../../../convex/_generated/api";

// Types
type FitnessGoal = "lose_weight" | "build_muscle" | "maintain";
type Gender = "male" | "female" | "other";
type ActivityLevel = "sedentary" | "lightly_active" | "active" | "very_active";
type Theme = "light" | "dark" | "system";

interface FormData {
  name: string;
  height: number | "";
  weight: number | "";
  age: number | "";
  gender: Gender | "";
  activityLevel: ActivityLevel | "";
  fitnessGoal: FitnessGoal | "";
  dailyCalorieTarget: number | "";
  proteinTarget: number | "";
  carbsTarget: number | "";
  fatTarget: number | "";
  theme: Theme;
}

// Hoisted static data
const FITNESS_GOALS = [
  { id: "lose_weight" as const, label: "Lose Weight", icon: "🔥" },
  { id: "build_muscle" as const, label: "Build Muscle", icon: "💪" },
  { id: "maintain" as const, label: "Maintain", icon: "⚖️" },
] as const;

const GENDERS = [
  { id: "male" as const, label: "Male" },
  { id: "female" as const, label: "Female" },
  { id: "other" as const, label: "Other" },
] as const;

const ACTIVITY_LEVELS = [
  { id: "sedentary" as const, label: "Sedentary", desc: "Little to no exercise" },
  { id: "lightly_active" as const, label: "Lightly Active", desc: "1-3 days/week" },
  { id: "active" as const, label: "Active", desc: "3-5 days/week" },
  { id: "very_active" as const, label: "Very Active", desc: "6-7 days/week" },
] as const;

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  lightly_active: 1.375,
  active: 1.55,
  very_active: 1.725,
};

// Calculate BMR using Mifflin-St Jeor equation
function calculateBMR(
  weight: number,
  height: number,
  age: number,
  gender: Gender | ""
): number {
  // Base calculation (male)
  let bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  
  // Adjust for gender
  if (gender === "female") {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }
  
  return bmr;
}

function calculateCalories(
  weight: number,
  height: number,
  age: number,
  gender: Gender | "",
  activityLevel: ActivityLevel | "",
  goal: FitnessGoal
): number {
  const bmr = calculateBMR(weight, height, age, gender);
  const multiplier = activityLevel ? ACTIVITY_MULTIPLIERS[activityLevel] : 1.55;
  const tdee = bmr * multiplier;

  switch (goal) {
    case "lose_weight":
      return Math.round(tdee - 500);
    case "build_muscle":
      return Math.round(tdee + 300);
    case "maintain":
    default:
      return Math.round(tdee);
  }
}

function calculateMacros(
  calories: number,
  goal: FitnessGoal
): { protein: number; carbs: number; fat: number } {
  // Macro ratios based on goal
  let proteinPercent: number;
  let carbsPercent: number;
  let fatPercent: number;

  switch (goal) {
    case "lose_weight":
      proteinPercent = 0.40;
      carbsPercent = 0.30;
      fatPercent = 0.30;
      break;
    case "build_muscle":
      proteinPercent = 0.30;
      carbsPercent = 0.45;
      fatPercent = 0.25;
      break;
    case "maintain":
    default:
      proteinPercent = 0.30;
      carbsPercent = 0.40;
      fatPercent = 0.30;
  }

  // Convert to grams (protein/carbs = 4 cal/g, fat = 9 cal/g)
  return {
    protein: Math.round((calories * proteinPercent) / 4),
    carbs: Math.round((calories * carbsPercent) / 4),
    fat: Math.round((calories * fatPercent) / 9),
  };
}

// Collapsible Section Component
function Section({
  title,
  icon,
  children,
  defaultOpen = true,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          {icon}
          <span className="font-semibold text-gray-900">{title}</span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>
      {isOpen && <div className="p-4 space-y-4">{children}</div>}
    </div>
  );
}

export function SettingsPanel() {
  const profile = useQuery(api.userProfile.get);
  const updateProfile = useMutation(api.userProfile.update);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    height: "",
    weight: "",
    age: "",
    gender: "",
    activityLevel: "",
    fitnessGoal: "",
    dailyCalorieTarget: "",
    proteinTarget: "",
    carbsTarget: "",
    fatTarget: "",
    theme: "system",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Load profile data when it arrives
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name ?? "",
        height: profile.height ?? "",
        weight: profile.weight ?? "",
        age: profile.age ?? "",
        gender: profile.gender ?? "",
        activityLevel: profile.activityLevel ?? "",
        fitnessGoal: profile.fitnessGoal ?? "",
        dailyCalorieTarget: profile.dailyCalorieTarget ?? "",
        proteinTarget: profile.proteinTarget ?? "",
        carbsTarget: profile.carbsTarget ?? "",
        fatTarget: profile.fatTarget ?? "",
        theme: profile.theme ?? "system",
      });
      setHasChanges(false);
    }
  }, [profile]);

  const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
    setSaveSuccess(false);
    setSaveError(null);
  };

  const handleAutoCalculate = () => {
    if (formData.weight && formData.height && formData.fitnessGoal) {
      const age = formData.age || 30;
      const calories = calculateCalories(
        formData.weight as number,
        formData.height as number,
        age as number,
        formData.gender,
        formData.activityLevel,
        formData.fitnessGoal
      );
      const macros = calculateMacros(calories, formData.fitnessGoal);

      setFormData((prev) => ({
        ...prev,
        dailyCalorieTarget: calories,
        proteinTarget: macros.protein,
        carbsTarget: macros.carbs,
        fatTarget: macros.fat,
      }));
      setHasChanges(true);
      setSaveSuccess(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      await updateProfile({
        name: formData.name || undefined,
        height: formData.height ? Number(formData.height) : undefined,
        weight: formData.weight ? Number(formData.weight) : undefined,
        age: formData.age ? Number(formData.age) : undefined,
        gender: formData.gender || undefined,
        activityLevel: formData.activityLevel || undefined,
        fitnessGoal: formData.fitnessGoal || undefined,
        dailyCalorieTarget: formData.dailyCalorieTarget
          ? Number(formData.dailyCalorieTarget)
          : undefined,
        proteinTarget: formData.proteinTarget
          ? Number(formData.proteinTarget)
          : undefined,
        carbsTarget: formData.carbsTarget
          ? Number(formData.carbsTarget)
          : undefined,
        fatTarget: formData.fatTarget ? Number(formData.fatTarget) : undefined,
        theme: formData.theme || undefined,
      });
      setHasChanges(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
      setSaveError(
        error instanceof Error ? error.message : "Failed to save settings. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (profile === undefined) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-green-600" />
        <span className="ml-2 text-gray-600">Loading settings...</span>
      </div>
    );
  }

  if (profile === null) {
    return (
      <div className="p-6 text-center text-gray-500">
        No profile found. Please complete onboarding first.
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <button
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all",
            hasChanges && !isSaving
              ? "bg-green-600 text-white hover:bg-green-700"
              : saveSuccess
              ? "bg-green-100 text-green-700"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          )}
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : saveSuccess ? (
            <>
              <Save className="w-4 h-4" />
              Saved!
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Changes
            </>
          )}
        </button>
      </div>

      {/* Error Message */}
      {saveError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {saveError}
        </div>
      )}

      {/* Section 1: Profile */}
      <Section
        title="Profile"
        icon={<User className="w-5 h-5 text-green-600" />}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => updateField("name", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Height (cm)
            </label>
            <input
              type="number"
              min="50"
              max="300"
              step="0.1"
              value={formData.height}
              onChange={(e) =>
                updateField("height", e.target.value ? Number(e.target.value) : "")
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Weight (kg)
            </label>
            <input
              type="number"
              min="20"
              max="500"
              step="0.1"
              value={formData.weight}
              onChange={(e) =>
                updateField("weight", e.target.value ? Number(e.target.value) : "")
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Age
            </label>
            <input
              type="number"
              min="10"
              max="120"
              value={formData.age}
              onChange={(e) =>
                updateField("age", e.target.value ? Number(e.target.value) : "")
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            />
          </div>
        </div>
      </Section>

      {/* Section 2: Body & Goals */}
      <Section
        title="Body & Goals"
        icon={<span className="text-xl">🎯</span>}
      >
        <div className="space-y-4">
          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gender
            </label>
            <div className="flex gap-3">
              {GENDERS.map((g) => (
                <button
                  key={g.id}
                  onClick={() => updateField("gender", g.id)}
                  className={cn(
                    "flex-1 px-4 py-2 rounded-lg border-2 font-medium transition-all",
                    formData.gender === g.id
                      ? "border-green-500 bg-green-50 text-green-700"
                      : "border-gray-200 hover:border-gray-300 text-gray-700"
                  )}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* Activity Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Activity Level
            </label>
            <div className="grid grid-cols-2 gap-2">
              {ACTIVITY_LEVELS.map((level) => (
                <button
                  key={level.id}
                  onClick={() => updateField("activityLevel", level.id)}
                  className={cn(
                    "p-3 rounded-lg border-2 text-left transition-all",
                    formData.activityLevel === level.id
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <p className="font-medium text-gray-900">{level.label}</p>
                  <p className="text-xs text-gray-500">{level.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Fitness Goal */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fitness Goal
            </label>
            <div className="flex gap-3">
              {FITNESS_GOALS.map((goal) => (
                <button
                  key={goal.id}
                  onClick={() => updateField("fitnessGoal", goal.id)}
                  className={cn(
                    "flex-1 px-4 py-3 rounded-lg border-2 font-medium transition-all",
                    formData.fitnessGoal === goal.id
                      ? "border-green-500 bg-green-50 text-green-700"
                      : "border-gray-200 hover:border-gray-300 text-gray-700"
                  )}
                >
                  <span className="text-lg mr-2">{goal.icon}</span>
                  {goal.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* Section 3: Nutrition Targets */}
      <Section
        title="Nutrition Targets"
        icon={<span className="text-xl">🍎</span>}
      >
        <div className="space-y-4">
          {/* Auto-calculate button */}
          <button
            onClick={handleAutoCalculate}
            disabled={!formData.weight || !formData.height || !formData.fitnessGoal}
            className={cn(
              "w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all",
              formData.weight && formData.height && formData.fitnessGoal
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            )}
          >
            <Calculator className="w-4 h-4" />
            Auto-calculate based on my stats
          </button>

          {/* Calorie Target */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Daily Calorie Target
            </label>
            <div className="relative">
              <input
                type="number"
                min="500"
                max="10000"
                step="50"
                value={formData.dailyCalorieTarget}
                onChange={(e) =>
                  updateField(
                    "dailyCalorieTarget",
                    e.target.value ? Number(e.target.value) : ""
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                kcal/day
              </span>
            </div>
          </div>

          {/* Macro Targets */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Protein
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="500"
                  step="1"
                  value={formData.proteinTarget}
                  onChange={(e) =>
                    updateField(
                      "proteinTarget",
                      e.target.value ? Number(e.target.value) : ""
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none pr-8"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                  g
                </span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Carbs
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="1000"
                  step="1"
                  value={formData.carbsTarget}
                  onChange={(e) =>
                    updateField(
                      "carbsTarget",
                      e.target.value ? Number(e.target.value) : ""
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none pr-8"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                  g
                </span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fat
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="500"
                  step="1"
                  value={formData.fatTarget}
                  onChange={(e) =>
                    updateField(
                      "fatTarget",
                      e.target.value ? Number(e.target.value) : ""
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none pr-8"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                  g
                </span>
              </div>
            </div>
          </div>

          {formData.dailyCalorieTarget && formData.proteinTarget && formData.carbsTarget && formData.fatTarget && (
            <p className="text-sm text-gray-500 text-center">
              Total from macros:{" "}
              {(formData.proteinTarget as number) * 4 +
                (formData.carbsTarget as number) * 4 +
                (formData.fatTarget as number) * 9}{" "}
              kcal
            </p>
          )}
        </div>
      </Section>

      {/* Section 4: App Preferences */}
      <Section
        title="App Preferences"
        icon={<Sun className="w-5 h-5 text-green-600" />}
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Theme
          </label>
          <div className="flex gap-3">
            <button
              onClick={() => updateField("theme", "light")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 font-medium transition-all",
                formData.theme === "light"
                  ? "border-green-500 bg-green-50 text-green-700"
                  : "border-gray-200 hover:border-gray-300 text-gray-700"
              )}
            >
              <Sun className="w-4 h-4" />
              Light
            </button>
            <button
              onClick={() => updateField("theme", "dark")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 font-medium transition-all",
                formData.theme === "dark"
                  ? "border-green-500 bg-green-50 text-green-700"
                  : "border-gray-200 hover:border-gray-300 text-gray-700"
              )}
            >
              <Moon className="w-4 h-4" />
              Dark
            </button>
            <button
              onClick={() => updateField("theme", "system")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 font-medium transition-all",
                formData.theme === "system"
                  ? "border-green-500 bg-green-50 text-green-700"
                  : "border-gray-200 hover:border-gray-300 text-gray-700"
              )}
            >
              <Monitor className="w-4 h-4" />
              System
            </button>
          </div>
        </div>
      </Section>
    </div>
  );
}
