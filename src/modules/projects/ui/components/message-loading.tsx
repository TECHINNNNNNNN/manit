export const MessageLoading = () => {
    return (
        <div className="flex flex-col group px-2 pb-4">
            <div className="flex items-center gap-2 pl-2 mb-2">
                <span className="text-sm font-medium">Manit</span>
            </div>
            <div className="pl-8.5 flex items-center gap-2">
                <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-75" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150" />
                </div>
                <span className="text-sm text-muted-foreground">Thinking...</span>
            </div>
        </div>
    )
}