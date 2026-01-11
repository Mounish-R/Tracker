const nextConfig = {
  /* config options here */
};

console.log("--- BUILD TIME ENV CHECK ---");
console.log("API_KEY present:", !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY);
console.log("Full Env Keys:", Object.keys(process.env).filter(k => k.startsWith('NEXT_')));
console.log("----------------------------");

export default nextConfig;
