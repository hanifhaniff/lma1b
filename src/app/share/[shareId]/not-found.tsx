import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md p-4">
        <Card className="w-full shadow-lg rounded-xl border-0">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto bg-red-50 p-3 rounded-full">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <div>
              <CardTitle className="text-2xl">Link Not Found</CardTitle>
              <CardDescription className="text-base mt-1 text-red-500">
                The file link you are looking for does not exist or has expired.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-center text-muted-foreground">
                This could be due to:
              </p>
              <ul className="mt-2 text-sm text-muted-foreground list-disc pl-5 space-y-1">
                <li>The link has expired (7 days)</li>
                <li>The file has been deleted</li>
                <li>The link is incorrect</li>
              </ul>
            </div>
          </CardContent>
          <div className="p-6 pt-0">
            <Link href="/" passHref>
              <Button className="w-full py-6 text-lg">
                Return to Homepage
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}