import { Composition, staticFile } from "remotion";
import { TextToVideo } from './Composition';
import './style.css';

const fps = 30;
const durationInFrames = 29 * fps;

export const RemotionRoot: React.FC = () => {
	const AUDIO_START = 6.9; // Seconds
	return (
		<>
			<Composition
				id="TextToVideo"
				component={TextToVideo}
				durationInFrames={durationInFrames}
				fps={fps}
				width={1080}
				height={1080}
				defaultProps={{
					// @ts-ignore
					audioOffsetInFrames: Math.round(AUDIO_START * fps),
					source: staticFile('subtitles.srt'),
				}}
			/>
		</>
	);
};
