import React, { useEffect, useRef, useState } from 'react';
import {
	AbsoluteFill,
	Audio,
	continueRender,
	delayRender, getInputProps,
	Sequence,
	useVideoConfig
} from "remotion";
import { PaginatedSubtitles } from './Subtitles';

const assemblyHeader = {
	Authorization: '25ef9c845f0f460c889352cb1b712707',
	'Content-Type': 'application/json',
}

export const TextToVideo: React.FC<{
	source: string;
	audioOffsetInFrames: number;
}> = ({ source, audioOffsetInFrames }) => {
	const { durationInFrames } = useVideoConfig();
console.log(getInputProps())
	// @ts-ignore
	const [handle] = useState(() => delayRender());
	// @ts-ignore
	const [subtitles, setSubtitles] = useState<string | null>(null);
	const ref = useRef<HTMLDivElement>(null);

	const convertTxtToSubs = (a: string) => {
		let result = '00:00:00,000';
		a = a+"";
		if (a.length < 4) {
			result = result.slice(0, a.length * -1);
			result = `${result}${a}`;
		} else if (a.length === 4) {
			result = result.slice(0, (a.length + 1) * -1);
			result = `${result}${a[0]},${a.slice(1)}`;
		} else if (a.length === 5) {
			result = result.slice(0, (a.length + 1) * -1);
			result = `${result}${a.slice(0, -3)},${a.slice(2)}`;
		} else if (a.length === 6) {
			result = result.slice(0, (a.length + 2) * -1);
			result = `${result}${a[0]}:${a.slice(1, -3)},${a.slice(2)}`;
		}
		return result;
	};

	const fetchTranscriptFromId = async (transcriptId:string) => {
		let res:any = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
			headers: assemblyHeader,
			method: 'get',
		})
		res = await res.json()
		if(res.status === "completed"){
			let subs = "";
			res.words.map(
				(data: { start: string; end: string; text: string }, index: any) => {
					subs = `${subs}${index}
${convertTxtToSubs(data.start)} --> ${convertTxtToSubs(data.end)}
${data.text}

`;
				}
			);
			setSubtitles(subs);
			continueRender(handle);
		}else{
			await setTimeout(async () => {
				console.log('Rechecking transcript status from pending')
				await fetchTranscriptFromId(transcriptId)
				return "success"
			},5000);
		}
		return "success"
	}

	useEffect( () => {
		// fetchTranscriptFromId("6efry8swbv-e53f-4ca0-b096-214ae427a956")
		fetch('https://api.assemblyai.com/v2/transcript', {
			headers: assemblyHeader,
			method: 'post',
			body: JSON.stringify({ audio_url: getInputProps()['audioSrc'] }),
		})
			.then((res: { json: () => any }) => res.json())
			.then((res: any) => {
				fetchTranscriptFromId(res.id)
			})
			.catch((e) => {
				console.log('error occurred');
			});
	}, [handle, source]);

	if (!subtitles) {
		return null;
	}

	return (
		<div ref={ref}>
			<AbsoluteFill>
				<Sequence from={-audioOffsetInFrames}>
					<Audio src={getInputProps()['audioSrc']} />
					<div
						className="container"
						style={{
							fontFamily: 'IBM Plex Sans',
						}}
					>
						<img
							src={getInputProps()['bg']}
							alt="bg"
							style={{
								position: "absolute",
								width: '100%',
								height: '100%',
								zIndex: 1
							}}
						/>
						<PaginatedSubtitles
							subtitles={subtitles}
							startFrame={audioOffsetInFrames}
							endFrame={audioOffsetInFrames + durationInFrames}
							linesPerPage={7}
						/>
					</div>
				</Sequence>
			</AbsoluteFill>
		</div>
	);
};
