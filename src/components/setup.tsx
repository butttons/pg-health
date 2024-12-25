import { Export, FileZip, Upload } from "@phosphor-icons/react";
import { ExternalLinkIcon } from "@radix-ui/react-icons";

import { FileUploader } from "@/components/file-uploader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TypographyInlineCode } from "@/components/ui/typograpghy";

export function Setup() {
	return (
		<Card className="p-6 space-y-4 divide-y">
			<div className="flex flex-col gap-2 lg:flex-row">
				<Export size={32} />
				<div className="flex flex-col flex-1 justify-between items-start lg:flex-row">
					<h2 className="flex gap-2 text-lg font-medium md:text-2xl">
						Export data from your device in XML format
					</h2>
					<Button asChild variant="link" className="px-0">
						<a href="https://support.apple.com/en-in/guide/iphone/iph5ede58c3d/ios#:~:text=Share%20your%20health%20and%20fitness%20data%20in%20XML%20format">
							Visit apple support article
							<ExternalLinkIcon />
						</a>
					</Button>
				</div>
			</div>
			<div className="flex flex-col gap-2 pt-4 lg:flex-row">
				<FileZip size={32} />
				<div className="flex flex-col flex-1 justify-between items-start lg:flex-row">
					<h2 className="flex gap-2 text-lg font-medium md:text-2xl">
						Extract the contents of the file
					</h2>
					<Button asChild variant="link" className="px-0">
						<a href="https://www.wikihow.com/Unzip-a-File">
							Visit wikiHow article
							<ExternalLinkIcon />
						</a>
					</Button>
				</div>
			</div>
			<div className="flex flex-col gap-2 pt-4 lg:flex-row">
				<Upload size={32} />
				<div className="flex flex-col flex-1 justify-between items-start lg:flex-row">
					<h2 className="flex gap-2 text-lg font-medium md:text-2xl">
						Upload the{" "}
						<TypographyInlineCode className="text-lg md:text-2xl">
							export.xml
						</TypographyInlineCode>{" "}
						file
					</h2>
				</div>
			</div>
			<div className="pt-4">
				<FileUploader />
			</div>
		</Card>
	);
}
