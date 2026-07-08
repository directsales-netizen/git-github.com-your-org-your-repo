interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-h3 font-heading font-bold text-neutral-white">{title}</h1>
        {description && <p className="mt-1 text-body-sm font-body text-neutral-silver">{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
