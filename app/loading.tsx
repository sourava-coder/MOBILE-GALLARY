export default function Loading() {
  return (
    <main className="page-loading" aria-label="Loading page">
      <div className="loading-bar loading-bar-short" />
      <div className="loading-title" />
      <div className="loading-copy" />
      <div className="loading-grid">
        <div className="loading-card" />
        <div className="loading-card" />
        <div className="loading-card" />
      </div>
    </main>
  );
}
