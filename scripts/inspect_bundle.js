async function inspectBundle() {
  const bundleUrl = "https://learnwithus.learnwithus2008.workers.dev/assets/index-B3Falaue.js";
  console.log("Fetching deployed bundle:", bundleUrl);
  const res = await fetch(bundleUrl);
  console.log("Bundle status:", res.status);
  const text = await res.text();
  console.log("Bundle size:", text.length, "bytes");

  // Check for API URLs
  const renderMatches = text.match(/https:\/\/[a-zA-Z0-9-]+\.onrender\.com[^\s"']*/g) || [];
  console.log("Render URLs in deployed bundle:", [...new Set(renderMatches)]);

  const apiMatches = text.match(/\/api\/[a-zA-Z0-9/_-]+/g) || [];
  console.log("API endpoints sample:", [...new Set(apiMatches)].slice(0, 15));
}

inspectBundle();

