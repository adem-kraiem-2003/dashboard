interface PageHeaderProps {
  title: string;
  description: string;
  actions?: React.ReactNode;
}

export default function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
      <div>
        <h1 className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          {title}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">{description}</p>
      </div>
      {actions && <div className="flex gap-3">{actions}</div>}
    </div>
  );
}
