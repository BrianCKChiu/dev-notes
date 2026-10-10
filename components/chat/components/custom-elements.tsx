import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { useRef, useState } from "react";

export function CustomPre({ children, ...props }) {

    const codeBlock = useRef<HTMLPreElement>(null);

    const [copied, setCopied] = useState<boolean>(false)

    async function copyCode() {
        try {
            if (codeBlock.current === null) return "";
            const rawText = codeBlock.current.innerText;
            const lang = codeBlock.current.getAttribute('data-lang')

            const markdownContent = `\`\`\`${lang}\n${rawText}\n\`\`\``;
            await navigator.clipboard.writeText(markdownContent);

            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    }


    return <pre ref={codeBlock} className="tm-code relative overflow-x-auto" {...props}>
        {children}
        <div className="copy-code-btn">
            {copied ? <span>Copied!</span> : <Button variant={"ghost"} size={"xs"} onClick={copyCode} title="Copy Code">
                <Copy />
            </Button>}
        </div>


    </pre>
}

export const markdownComponents = {
    pre: CustomPre,
};
