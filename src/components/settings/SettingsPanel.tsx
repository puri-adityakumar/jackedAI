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
import { useEffect, useId, useState } from "react";
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
  { id: "lightly_active" as const, label: "Lightly Active", desc: "1–3 days/week" },
  { id: "active" as const, label: "Active", desc: "3–5 days/week" },
  { id: "very_active" as const, label: "Very Active", desc: "6–7 days/week" },
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
  let bmr = 10 * weight + 6.25 * height - 5 * age + 5;
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
  const contentId = useId();

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card shadow-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
        aria-expanded={isOpen}
        aria-controls={contentId}
        className="w-full flex items-center justify-between p-4 bg-muted/50 hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
      >
        <div className="flex items-center gap-3">
          <span aria-hidden="true">{icon}</span>
          <span className="font-semibold text-foreground">{title}</span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
        ) : (
          <ChevronDown className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
        )}
      </button>
      <div
        id={contentId}
        role="region"
        hidden={!isOpen}
        className={cn("p-4 space-y-4", !isOpen && "hidden")}
      >
        {children}
      </div>
    </div>
  );
}

// Form Input Component with proper accessibility
function FormInput({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  min,
  max,
  step,
  suffix,
  autoComplete,
}: {
  label: string;
  type?: "text" | "number" | "email";
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  autoComplete?: string;
}) {
  const inputId = useId();

  return (
    <div>
      <label htmlFor={inputId} className="block text-sm font-medium text-foreground mb-1.5">
        {label}
      </label>
      <div className="relative">
        <input
          id={inputId}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ? `${placeholder}…` : undefined}
          min={min}
          max={max}
          step={step}
          autoComplete={autoComplete}
          spellCheck={type === "email" ? false : undefined}
          className={cn(
            "w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground",
            "placeholder:text-muted-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-transparent",
            "transition-colors",
            suffix && "pr-16"
          )}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

// Selection Button Component
function SelectionButton({
  selected,
  onClick,
  children,
  className,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      className={cn(
        "rounded-lg border-2 font-medium transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        selected
          ? "border-primary bg-primary/10 text-primary"
          : "border-border hover:border-primary/50 text-foreground hover:bg-accent",
        className
      )}
    >
      {children}
    </button>
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
      <div className="flex items-center justify-center p-8 gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-primary" aria-hidden="true" />
        <span className="text-muted-foreground">Loading settings…</span>
      </div>
    );
  }

  if (profile === null) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        No profile found. Please complete onboarding first.
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Settings</h1>
        <button
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            hasChanges && !isSaving
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : saveSuccess
              ? "bg-primary/20 text-primary"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          )}
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              Saving…
            </>
          ) : saveSuccess ? (
            <>
              <Save className="w-4 h-4" aria-hidden="true" />
              Saved!
            </>
          ) : (
            <>
              <Save className="w-4 h-4" aria-hidden="true" />
              Save Changes
            </>
          )}
        </button>
      </div>

      {/* Error Message */}
      {saveError && (
        <div
          role="alert"
          aria-live="polite"
          className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded-lg"
        >
          {saveError}
        </div>
      )}

      {/* Section 1: Profile */}
      <Section
        title="Profile"
        icon={<User className="w-5 h-5 text-primary" />}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <FormInput
              label="Name"
              value={formData.name}
              onChange={(v) => updateField("name", v)}
              placeholder="Your name"
              autoComplete="name"
            />
          </div>
          <FormInput
            label="Height (cm)"
            type="number"
            value={formData.height}
            onChange={(v) => updateField("height", v ? Number(v) : "")}
            placeholder="175"
            min={50}
            max={300}
            step={0.1}
            autoComplete="off"
          />
          <FormInput
            label="Weight (kg)"
            type="number"
            value={formData.weight}
            onChange={(v) => updateField("weight", v ? Number(v) : "")}
            placeholder="70"
            min={20}
            max={500}
            step={0.1}
            autoComplete="off"
          />
          <FormInput
            label="Age"
            type="number"
            value={formData.age}
            onChange={(v) => updateField("age", v ? Number(v) : "")}
            placeholder="25"
            min={10}
            max={120}
            autoComplete="off"
          />
        </div>
      </Section>

      {/* Section 2: Body & Goals */}
      <Section
        title="Body & Goals"
        icon={<span className="text-xl">🎯</span>}
      >
        <div className="space-y-5">
          {/* Gender */}
          <fieldset>
            <legend className="block text-sm font-medium text-foreground mb-2">Gender</legend>
            <div className="flex gap-3" role="radiogroup" aria-label="Gender selection">
              {GENDERS.map((g) => (
                <SelectionButton
                  key={g.id}
                  selected={formData.gender === g.id}
                  onClick={() => updateField("gender", g.id)}
                  className="flex-1 px-4 py-2.5"
                >
                  {g.label}
                </SelectionButton>
              ))}
            </div>
          </fieldset>

          {/* Activity Level */}
          <fieldset>
            <legend className="block text-sm font-medium text-foreground mb-2">Activity Level</legend>
            <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Activity level selection">
              {ACTIVITY_LEVELS.map((level) => (
                <SelectionButton
                  key={level.id}
                  selected={formData.activityLevel === level.id}
                  onClick={() => updateField("activityLevel", level.id)}
                  className="p-3 text-left"
                >
                  <p className="font-medium">{level.label}</p>
                  <p className="text-xs text-muted-foreground">{level.desc}</p>
                </SelectionButton>
              ))}
            </div>
          </fieldset>

          {/* Fitness Goal */}
          <fieldset>
            <legend className="block text-sm font-medium text-foreground mb-2">Fitness Goal</legend>
            <div className="flex gap-3" role="radiogroup" aria-label="Fitness goal selection">
              {FITNESS_GOALS.map((goal) => (
                <SelectionButton
                  key={goal.id}
                  selected={formData.fitnessGoal === goal.id}
                  onClick={() => updateField("fitnessGoal", goal.id)}
                  className="flex-1 px-4 py-3"
                >
                  <span className="text-lg mr-2" aria-hidden="true">{goal.icon}</span>
                  {goal.label}
                </SelectionButton>
              ))}
            </div>
          </fieldset>
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
            type="button"
            onClick={handleAutoCalculate}
            disabled={!formData.weight || !formData.height || !formData.fitnessGoal}
            className={cn(
              "w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              formData.weight && formData.height && formData.fitnessGoal
                ? "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            <Calculator className="w-4 h-4" aria-hidden="true" />
            Auto-calculate Based on My Stats
          </button>

          {/* Calorie Target */}
          <FormInput
            label="Daily Calorie Target"
            type="number"
            value={formData.dailyCalorieTarget}
            onChange={(v) => updateField("dailyCalorieTarget", v ? Number(v) : "")}
            placeholder="2000"
            min={500}
            max={10000}
            step={50}
            suffix="kcal/day"
            autoComplete="off"
          />

          {/* Macro Targets */}
          <div className="grid grid-cols-3 gap-4">
            <FormInput
              label="Protein"
              type="number"
              value={formData.proteinTarget}
              onChange={(v) => updateField("proteinTarget", v ? Number(v) : "")}
              placeholder="150"
              min={0}
              max={500}
              step={1}
              suffix="g"
              autoComplete="off"
            />
            <FormInput
              label="Carbs"
              type="number"
              value={formData.carbsTarget}
              onChange={(v) => updateField("carbsTarget", v ? Number(v) : "")}
              placeholder="200"
              min={0}
              max={1000}
              step={1}
              suffix="g"
              autoComplete="off"
            />
            <FormInput
              label="Fat"
              type="number"
              value={formData.fatTarget}
              onChange={(v) => updateField("fatTarget", v ? Number(v) : "")}
              placeholder="65"
              min={0}
              max={500}
              step={1}
              suffix="g"
              autoComplete="off"
            />
          </div>

          {formData.dailyCalorieTarget && formData.proteinTarget && formData.carbsTarget && formData.fatTarget && (
            <p className="text-sm text-muted-foreground text-center font-variant-numeric: tabular-nums">
              Total from macros:{" "}
              <span className="font-medium text-foreground">
                {(formData.proteinTarget as number) * 4 +
                  (formData.carbsTarget as number) * 4 +
                  (formData.fatTarget as number) * 9}
              </span>{" "}
              kcal
            </p>
          )}
        </div>
      </Section>

      {/* Section 4: App Preferences */}
      <Section
        title="App Preferences"
        icon={<Sun className="w-5 h-5 text-primary" />}
      >
        <fieldset>
          <legend className="block text-sm font-medium text-foreground mb-2">Theme</legend>
          <div className="flex gap-3" role="radiogroup" aria-label="Theme selection">
            <SelectionButton
              selected={formData.theme === "light"}
              onClick={() => updateField("theme", "light")}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3"
            >
              <Sun className="w-4 h-4" aria-hidden="true" />
              Light
            </SelectionButton>
            <SelectionButton
              selected={formData.theme === "dark"}
              onClick={() => updateField("theme", "dark")}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3"
            >
              <Moon className="w-4 h-4" aria-hidden="true" />
              Dark
            </SelectionButton>
            <SelectionButton
              selected={formData.theme === "system"}
              onClick={() => updateField("theme", "system")}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3"
            >
              <Monitor className="w-4 h-4" aria-hidden="true" />
              System
            </SelectionButton>
          </div>
        </fieldset>
      </Section>
    </div>
  );
}
