declare interface HTMLElement
{
  mozRequestFullScreen(): void;
  webkitRequestFullscreen(): void;
  msRequestFullscreen(): void;
}

type Monetization = EventTarget & { state: 'stopped' | 'pending' | 'started' };
declare interface Document
{
  monetization: Monetization
}