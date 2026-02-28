import { Button } from "@repo/ui";
import { Link } from "react-router-dom";

export const DashboardHomePage = () => {
  return (
    <section className="flex flex-1 flex-col gap-4">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Manage your pets and view their health information.
        </p>
      </header>
      <div className="mt-4 flex gap-4">
        <Link
          to="/dashboard/pets"
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          View pets
        </Link>
        <Button  variant="flat"  >
          View pets
        </Button>
        <Button >
          View pets
        </Button>
      </div>
    </section>
  );
};

