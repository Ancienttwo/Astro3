import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

interface DisclaimerCardProps {
  className?: string;
}

export function DisclaimerCard({ className = "" }: DisclaimerCardProps) {
  return (
    <Card className={`bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/30 ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
              Disclaimer
            </h3>
            <p className="text-amber-700 dark:text-amber-300 text-sm leading-relaxed">
              This website shares information for learning and entertainment purposes only. Any advice here is just a suggestion and shouldn't be your sole guide for decisions. Your future rests in your hands, and it is your choices and actions that sculpt it. Use your judgment wisely and consult experts for major decisions.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 