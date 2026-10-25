import React, { useState } from 'react';
import { X, Copy, Check, FileCode, Database, Terminal, BookOpen, Download } from 'lucide-react';
import { ANDROID_PROJECT_FILES, CodeFile } from '../data/androidProjectData';

interface CodeInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CodeInspectorModal: React.FC<CodeInspectorModalProps> = ({ isOpen, onClose }) => {
  const [selectedFile, setSelectedFile] = useState<CodeFile>(ANDROID_PROJECT_FILES[0]);
  const [copied, setCopied] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  if (!isOpen) return null;

  const categories = ['All', 'Kotlin', 'Gradle', 'Manifest', 'SQL', 'Documentation'];

  const filteredFiles =
    selectedCategory === 'All'
      ? ANDROID_PROJECT_FILES
      : ANDROID_PROJECT_FILES.filter((f) => f.category === selectedCategory);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([selectedFile.code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = selectedFile.name;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl h-[90vh] bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Android Studio Source Explorer</span>
                <span className="text-[10px] bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded-full font-mono">
                  Kotlin 2.0 • Jetpack Compose
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Complete Architecture, Hilt DI, Retrofit & Supabase PostgreSQL code for Viva evaluation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Categories Bar */}
        <div className="px-5 py-2.5 bg-slate-950/40 border-b border-slate-800 flex items-center gap-2 overflow-x-auto shrink-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
          {/* File Explorer Sidebar */}
          <div className="w-full md:w-64 border-r border-slate-800 bg-slate-950/50 p-2 overflow-y-auto shrink-0 max-h-40 md:max-h-full">
            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-2 py-1">
              Project Structure
            </div>
            <div className="space-y-1">
              {filteredFiles.map((file) => (
                <button
                  key={file.path}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center gap-2 transition cursor-pointer ${
                    selectedFile.path === file.path
                      ? 'bg-sky-600/20 text-sky-400 border border-sky-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  {file.category === 'SQL' ? (
                    <Database className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  ) : file.category === 'Documentation' ? (
                    <BookOpen className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <FileCode className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  )}
                  <span className="truncate font-mono">{file.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Code Viewer Panel */}
          <div className="flex-1 flex flex-col overflow-hidden bg-slate-950/80">
            {/* File info bar */}
            <div className="px-4 py-2 border-b border-slate-800/80 flex items-center justify-between text-xs text-slate-400 bg-slate-900/40">
              <div className="min-w-0 pr-2">
                <span className="font-mono text-slate-200">{selectedFile.path}</span>
                <p className="text-[11px] text-slate-400 truncate">{selectedFile.description}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium transition cursor-pointer"
                  title="Download raw file"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Save</span>
                </button>
              </div>
            </div>

            {/* Code Pre container */}
            <div className="flex-1 overflow-auto p-4 font-mono text-xs text-slate-300 leading-relaxed selection:bg-sky-500 selection:text-white">
              <pre className="whitespace-pre">
                <code>{selectedFile.code}</code>
              </pre>
            </div>
          </div>
        </div>

        {/* Footer info for Major Project Evaluators */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0">
          <div>
            <span className="text-slate-300 font-semibold">Major Project Highlights:</span> Clean MVVM, Hilt DI, Retrofit, Database Concurrency Lock, Gemini AI Medical Triage.
          </div>
          <div className="text-teal-400 font-mono text-[11px]">
            Target SDK 35 (Android 15 Ready)
          </div>
        </div>
      </div>
    </div>
  );
};
