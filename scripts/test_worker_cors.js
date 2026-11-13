async function testWorkerCors() {
  const origin = "https://learnwithus.learnwithus2008.workers.dev";
  const backendUrl = "https://learnwithus-11jz.onrender.com/api/health";

  console.log("Testing CORS with origin:", origin);

  // Preflight
  const optRes = await fetch(backendUrl, {
    method: "OPTIONS",
    headers: {
      "Origin": origin,
      "Access-Control-Request-Method": "POST",
      "Access-Control-Request-Headers": "Content-Type, Authorization"
    }
  });
  console.log("OPTIONS status:", optRes.status);
  console.log("OPTIONS Access-Control-Allow-Origin:", optRes.headers.get("access-control-allow-origin"));
  console.log("OPTIONS Access-Control-Allow-Credentials:", optRes.headers.get("access-control-allow-credentials"));
  console.log("OPTIONS Access-Control-Allow-Headers:", optRes.headers.get("access-control-allow-headers"));

  // GET
  const getRes = await fetch(backendUrl, {
    method: "GET",
    headers: { "Origin": origin }
  });
  console.log("GET status:", getRes.status);
  console.log("GET Access-Control-Allow-Origin:", getRes.headers.get("access-control-allow-origin"));
  console.log("GET Access-Control-Allow-Credentials:", getRes.headers.get("access-control-allow-credentials"));
}

testWorkerCors();

