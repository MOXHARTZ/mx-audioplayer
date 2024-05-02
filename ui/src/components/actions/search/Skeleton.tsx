import { Card, CardHeader, Skeleton } from "@nextui-org/react";

export default function SearchSkeleton() {
    return (
        <Card className="w-full text-left" radius="lg">
            <CardHeader className="flex gap-3">
                <Skeleton className="rounded-sm">
                    <div className="w-16 h-16 bg-default-300 rounded-sm"></div>
                </Skeleton>
                <div className="flex flex-col">
                    <Skeleton>
                        <div className="h-3 w-3/5 rounded-lg bg-default-200"></div>
                    </Skeleton>
                    <Skeleton>
                        <div className="h-3 w-4/5 rounded-lg bg-default-200"></div>
                    </Skeleton>
                </div>
            </CardHeader>
        </Card>
    )
}