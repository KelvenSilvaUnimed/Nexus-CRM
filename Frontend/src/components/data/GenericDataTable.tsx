export type Column = {
  key: string;
  label: string;
};

type GenericDataTableProps = {
  title: string;
  description?: string;
  columns: Column[];
  data: Array<Record<string, string>>;
};

export function GenericDataTable({
  title,
  description,
  columns,
  data,
}: GenericDataTableProps) {
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Visor dinamico</p>
          <h2>{title}</h2>
          {description ? <p className="muted">{description}</p> : null}
        </div>
        <button type="button" className="ghost-button">
          Atualizar dados
        </button>
      </div>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key}>{column.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index}>
                {columns.map((column) => (
                  <td key={column.key}>{row[column.key]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
