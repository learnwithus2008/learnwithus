async function check() {
  try {
    const res = await fetch("https://learnwithus.learnwithus2008.workers.dev");
    console.log("Worker status:", res.status);
    const text = await res.text();
    console.log("Response length:", text.length);
    console.log("First 300 chars:", text.slice(0, 300));

    // Extract script tags
    const scriptMatches = [...text.matchAll(/src=["']([^"']+\.js)["']/g)].map(m => m[1]);
    console.log("Scripts found:", scriptMatches);
  } catch (err) {
    console.error("Error fetching worker:", err.message);
  }
}

check();

