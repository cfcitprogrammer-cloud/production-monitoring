import Page from "../ui/_page";
import { Card, CardContent, CardHeader, Input, Button } from "@heroui/react";

export default function LoginPage() {
  return (
    <Page>
      <div className="flex min-h-screen items-center justify-center bg-default-50 px-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="flex flex-col gap-1 text-center">
            <h1 className="text-2xl font-bold">Welcome Back</h1>
            <p className="text-sm text-default-500">Sign in to continue</p>
          </CardHeader>

          <CardContent className="gap-4">
            <form className="flex flex-col gap-4">
              <Input type="email" placeholder="you@example.com" />

              <Input type="password" placeholder="Enter your password" />

              <Button size="lg" className="w-full">
                Sign In
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Page>
  );
}
