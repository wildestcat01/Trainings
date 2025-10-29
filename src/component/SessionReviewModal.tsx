import { Fragment, useMemo } from 'react';
import {
  PlayCircle,
  FileText,
  Bot,
  Zap,
  Activity
} from 'lucide-react';

interface SessionReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: {
    moduleTitle: string;
    moduleCategory?: string;
    employeeName: string;
    teamName: string;
    completedAt?: string | null;
    testScore?: number | null;
    progressPercentage: number;
  } | null;
}

const clampScore = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

export const SessionReviewModal = ({ isOpen, onClose, session }: SessionReviewModalProps) => {
  const metrics = useMemo(() => {
    if (!session) return [];
    const effectivenessBase =
      session.testScore != null
        ? (session.testScore + session.progressPercentage) / 2
        : session.progressPercentage;
    const effectiveness = clampScore(effectivenessBase);
    const attentiveness = clampScore(effectiveness + 5);
    const proactiveness = clampScore(effectiveness - 3 + (session.testScore ?? effectiveness) * 0.1);
    const collaboration = clampScore((effectiveness + attentiveness + proactiveness) / 3);

    return [
      { label: 'Effectiveness', value: effectiveness, tone: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
      { label: 'Attentiveness', value: attentiveness, tone: 'bg-blue-100 text-blue-700 border-blue-200' },
      { label: 'Proactiveness', value: proactiveness, tone: 'bg-amber-100 text-amber-700 border-amber-200' },
      { label: 'Collaboration', value: collaboration, tone: 'bg-purple-100 text-purple-700 border-purple-200' },
    ];
  }, [session?.progressPercentage, session?.testScore]);

  const transcript = useMemo(() => {
    if (!session) return [];
    const base = session.moduleTitle.split(' ').slice(0, 3).join(' ');
    return [
      `${session.employeeName} summarised key takeaways from ${base}.`,
      'Discussed actionable next steps with the facilitator.',
      'Responded to scenario-based questions demonstrating applied understanding.',
      'Outlined follow-up items for the broader team.'
    ];
  }, [session?.employeeName, session?.moduleTitle]);

  if (!isOpen || !session) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <p className="text-sm uppercase tracking-wide text-slate-500">Session Review</p>
            <h2 className="text-xl font-semibold text-slate-900">
              {session.moduleTitle}
              {session.moduleCategory ? <span className="text-slate-400 font-normal"> · {session.moduleCategory}</span> : null}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {session.employeeName} · {session.teamName} · {session.completedAt ? new Date(session.completedAt).toLocaleString() : 'Completion date pending'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
          >
            Close
          </button>
        </div>

        <div className="flex-1 overflow-auto px-6 py-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
              <div className="flex items-center gap-3 mb-4">
                <PlayCircle className="w-6 h-6 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-slate-900">Session Recording</h3>
                  <p className="text-xs text-slate-500">Full playback available for review</p>
                </div>
              </div>
              <div className="aspect-video w-full bg-slate-200 rounded-lg flex items-center justify-center text-slate-500">
                <div className="text-center space-y-1">
                  <PlayCircle className="w-10 h-10 mx-auto text-slate-500" />
                  <p className="text-sm font-medium">Recording Placeholder</p>
                  <p className="text-xs text-slate-500">Streamed securely via LMS</p>
                </div>
              </div>
            </div>

            <div className="border border-slate-200 rounded-lg p-4 bg-white">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="w-6 h-6 text-slate-600" />
                <div>
                  <h3 className="font-semibold text-slate-900">Transcript Highlights</h3>
                  <p className="text-xs text-slate-500">Key excerpts from automated transcript</p>
                </div>
              </div>
              <div className="space-y-3 text-sm text-slate-700">
                {transcript.map((line, index) => (
                  <Fragment key={`${line}-${index}`}>
                    <div className="flex gap-2">
                      <span className="mt-1 h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />
                      <p>{line}</p>
                    </div>
                  </Fragment>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 border border-slate-200 rounded-lg p-4 bg-white">
              <div className="flex items-center gap-3 mb-4">
                <Bot className="w-6 h-6 text-purple-600" />
                <div>
                  <h3 className="font-semibold text-slate-900">AI Analysis</h3>
                  <p className="text-xs text-slate-500">Realtime coaching insights</p>
                </div>
              </div>
              <div className="space-y-3">
                {metrics.map((metric) => (
                  <div key={metric.label} className="border border-slate-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700">{metric.label}</span>
                      <span className="text-sm font-semibold text-slate-900">{metric.value}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className={`h-full rounded-full border ${metric.tone}`}
                        style={{ width: `${metric.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 space-y-3">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-amber-500" />
                <div>
                  <h3 className="font-semibold text-slate-900 text-sm">Coaching Notes</h3>
                  <p className="text-xs text-slate-500">AI-generated follow ups</p>
                </div>
              </div>
              <ul className="list-disc list-inside text-xs text-slate-600 space-y-2">
                <li>Highlight best moments from the session recording during next team huddle.</li>
                <li>Encourage peer-to-peer coaching leveraging the transcript summary.</li>
                <li>Schedule a quick retro to celebrate completed modules and analyse improvements.</li>
              </ul>
              <div className="flex items-center gap-3 border border-slate-200 rounded-lg p-3 bg-white">
                <Activity className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Overall Impact</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {session.progressPercentage}% completion · {session.testScore ?? '--'}% assessment score
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
