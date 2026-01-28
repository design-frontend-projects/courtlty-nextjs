const { performance } = require('perf_hooks');

const DELAY_PENDING_COURTS = 150;
const DELAY_STATS_COURTS = 50;
const DELAY_STATS_USERS = 60;

const mockSupabase = {
  from: (table) => {
    let isPendingQuery = false;

    const builder = {
      select: (cols, opts) => builder,
      eq: (col, val) => {
        if (col === 'status' && val === 'pending') isPendingQuery = true;
        return builder;
      },
      order: (col, opts) => builder,
      then: (resolve, reject) => {
        let delay = 50;
        let result = {};

        if (table === 'courts') {
            if (isPendingQuery) {
                delay = DELAY_PENDING_COURTS;
                result = { data: [] };
            } else {
                delay = DELAY_STATS_COURTS;
                result = { count: 100 };
            }
        } else if (table === 'auth.users' || table === 'profiles') {
            delay = DELAY_STATS_USERS;
            result = { count: 50 };
        }

        setTimeout(() => resolve(result), delay);
      }
    };
    return builder;
  }
};

async function runSequential() {
  const start = performance.now();

  // Fetch pending courts
  const { data: pendingCourts } = await mockSupabase
    .from("courts")
    .select("*, profiles(full_name, email)")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  // Fetch stats
  const { count: courtsCount } = await mockSupabase.from("courts").select("*", { count: "exact", head: true });
  const { count: usersCount } = await mockSupabase.from("profiles").select("*", { count: "exact", head: true });

  const end = performance.now();
  return end - start;
}

async function runParallel() {
  const start = performance.now();

  const [
    { data: pendingCourts },
    { count: courtsCount },
    { count: usersCount },
  ] = await Promise.all([
    mockSupabase
      .from("courts")
      .select("*, profiles(full_name, email)")
      .eq("status", "pending")
      .order("created_at", { ascending: false }),
    mockSupabase.from("courts").select("*", { count: "exact", head: true }),
    mockSupabase.from("profiles").select("*", { count: "exact", head: true }),
  ]);

  const end = performance.now();
  return end - start;
}

async function main() {
  console.log("Running Benchmark...");

  const seqTime = await runSequential();
  console.log(`Sequential Time: ${seqTime.toFixed(2)}ms`);

  const parTime = await runParallel();
  console.log(`Parallel Time:   ${parTime.toFixed(2)}ms`);

  const diff = seqTime - parTime;
  const pct = (diff / seqTime * 100);
  console.log(`Improvement:     ${diff.toFixed(2)}ms (${pct.toFixed(1)}%)`);
}

main();
