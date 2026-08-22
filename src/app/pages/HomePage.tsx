'use client'

export default function HomePage() {
    return (
        <div className="mx-auto max-w-2xl space-y-4 p-6">
            <h1 className="text-3xl font-bold tracking-tight">Playground</h1>
            <p className="text-muted-foreground">
                I&apos;m Yogesh Kumar, a full-stack engineer. This is my
                personal React playground to try out new features individually,
                without putting them all together into a project.
            </p>
            <p className="text-muted-foreground">
                Work I actually ship lives on my{' '}
                <a
                    href="https://yogesh-kumar-portfolio-v2.vercel.app/"
                    className="font-medium text-foreground underline underline-offset-4 hover:no-underline"
                    target="_blank"
                    rel="noreferrer"
                >
                    portfolio
                </a>
                .
            </p>
        </div>
    )
}
