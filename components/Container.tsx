
export default function Container({ children }: { children: React.ReactNode }) {
    return (
        <div className="container mx-auto flex flex-col gap-6">
            {children}
        </div>
    );
}