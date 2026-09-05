import { Routes, Route, Navigate } from "react-router-dom";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ProtectedRoute, AdminRoute } from "@/components/ProtectedRoute";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Landing } from "@/pages/Landing";
import { Login } from "@/pages/auth/Login";
import { Signup } from "@/pages/auth/Signup";
import { ForgotPassword } from "@/pages/auth/ForgotPassword";
import { NotFound } from "@/pages/NotFound";
import { Dashboard } from "@/pages/app/Dashboard";
import { Courses } from "@/pages/app/Courses";
import { Grammar } from "@/pages/app/Grammar";
import { Vocabulary } from "@/pages/app/Vocabulary";
import { MockTests } from "@/pages/app/MockTests";
import { MockTestRunner } from "@/pages/app/MockTestRunner";
import { MockTestResults } from "@/pages/app/MockTestResults";
import { StudyPlan } from "@/pages/app/StudyPlan";
import { Progress } from "@/pages/app/Progress";
import { Achievements } from "@/pages/app/Achievements";
import { Market } from "@/pages/app/Market";
import { Friends } from "@/pages/app/Friends";
import { Settings } from "@/pages/app/Settings";
import { AdminDashboard } from "@/pages/admin/AdminDashboard";
import { AdminUsers } from "@/pages/admin/AdminUsers";
import { AdminQuestions } from "@/pages/admin/AdminQuestions";
import { AdminVocabulary } from "@/pages/admin/AdminVocabulary";
import { AdminCourses } from "@/pages/admin/AdminCourses";
import { AdminWriting } from "@/pages/admin/AdminWriting";
import { AdminSpeaking } from "@/pages/admin/AdminSpeaking";
import { AdminGrammar } from "@/pages/admin/AdminGrammar";
import { AdminMocks } from "@/pages/admin/AdminMocks";
import { AdminAchievements } from "@/pages/admin/AdminAchievements";
import { AdminSettings } from "@/pages/admin/AdminSettings";
import { AdminIeltsBuilder } from "@/pages/admin/AdminIeltsBuilder";
import { Arena } from "@/pages/app/Arena";
import { CDIPractice } from "@/pages/app/CDIPractice";
import { XpToastListener } from "@/components/XpToastListener";
import type { Skill } from "@/types";

export default function App() {
  return (
    <>
      <XpToastListener />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Landing />} />
        </Route>

        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/app" element={<Dashboard />} />
            <Route path="/app/courses" element={<Courses />} />
            <Route path="/app/practice" element={<CDIPractice />} />
            <Route path="/app/grammar" element={<Grammar />} />
            <Route path="/app/vocabulary" element={<Vocabulary />} />
            <Route path="/app/mock-test" element={<MockTests />} />
            <Route
              path="/app/mock-test/start/:id"
              element={<MockTestRunner />}
            />
            <Route
              path="/app/mock-test/results/:id"
              element={<MockTestResults />}
            />
            <Route path="/app/cdi-practice" element={<CDIPractice />} />
            <Route path="/app/study-plan" element={<StudyPlan />} />
            <Route path="/app/progress" element={<Progress />} />
            <Route path="/app/achievements" element={<Achievements />} />
            <Route path="/app/arena" element={<Arena />} />
            <Route path="/app/market" element={<Market />} />
            <Route path="/app/friends" element={<Friends />} />
            <Route path="/app/settings" element={<Settings />} />
          </Route>
        </Route>

        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route
              path="/admin/ielts-builder"
              element={<AdminIeltsBuilder />}
            />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/questions" element={<AdminQuestions />} />
            <Route path="/admin/vocabulary" element={<AdminVocabulary />} />
            <Route path="/admin/courses" element={<AdminCourses />} />
            <Route path="/admin/writing" element={<AdminWriting />} />
            <Route path="/admin/speaking" element={<AdminSpeaking />} />
            <Route path="/admin/grammar" element={<AdminGrammar />} />
            <Route path="/admin/mock-tests" element={<AdminMocks />} />
            <Route path="/admin/achievements" element={<AdminAchievements />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export { Navigate };
export type { Skill };
