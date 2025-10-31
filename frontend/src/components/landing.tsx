import {
  CardTitle,
  CardDescription,
  CardHeader,
  CardContent,
  Card,
} from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { useState } from "react";
import axios from "axios";

const BACKEND_UPLOAD_URL = "http://localhost:3000";

export function Landing() {
  const [repoUrl, setRepoUrl] = useState("");
  const [uploadId, setUploadId] = useState("");
  const [uploading, setUploading] = useState(false);
  const [deployed, setDeployed] = useState(false);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50p-4">
      {!deployed && (
        <Card className="w-1/2 max-w-md ">
          <CardHeader>
            <CardTitle className="text-xl font-bold">
              Deploy your GitHub Repository
            </CardTitle>
            <CardDescription>
              Enter the URL of your GitHub repository to deploy it
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="github-url">GitHub Repository URL</Label>
                <Input
                  onChange={(e) => {
                    setRepoUrl(e.target.value);
                  }}
                  placeholder="https://github.com/username/repo"
                />
              </div>
              <Button
                onClick={async () => {
                  setUploading(true);
                  const res = await axios.post(`${BACKEND_UPLOAD_URL}/upload`, {
                    repoUrl: repoUrl,
                  });
                  setUploadId(res.data.id);
                  setUploading(false);
                  const interval = setInterval(async () => {
                    const response = await axios.get(
                      `${BACKEND_UPLOAD_URL}/status/${res.data.id}`
                    );

                    if (response.data.status === "deployed") {
                      clearInterval(interval);
                      setDeployed(true);
                    }
                  }, 3000);
                }}
                disabled={uploadId !== "" || uploading}
                className="w-full bg-black text-white font-semibold cursor-pointer"
                type="submit"
              >
                {uploadId
                  ? `Deploying (${uploadId})`
                  : uploading
                  ? "Uploading..."
                  : "Upload"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      {deployed && (
        <Card className="w-full max-w-md mt-8">
          <CardHeader>
            <CardTitle className="text-xl">Deployment Status</CardTitle>
            <CardDescription>
              Your website is successfully deployed!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="deployed-url">Deployed URL</Label>
              <Input
                id="deployed-url"
                readOnly
                type="url"
                value={`http://${uploadId}.localhost:3001/index.html`}
              />
            </div>
            <br />
            <Button className="w-full bg-black text-white" variant="outline">
              <a
                href={`http://${uploadId}.localhost:3001/index.html`}
                target="_blank"
              >
                Visit Website
              </a>
            </Button>
            <Button className="w-full bg-black text-white cursor-pointer" variant="outline"
            onClick={()=>{
              setUploadId("")
              setDeployed(false)
            }}
            >
              ➕ Deploy a new repo
            </Button>
          </CardContent>
        </Card>
      )}

    </main>
  );
}
