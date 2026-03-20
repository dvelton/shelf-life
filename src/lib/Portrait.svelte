<script>
  import { onMount } from 'svelte';
  import BigPicture from './chapters/BigPicture.svelte';
  import Timeline from './chapters/Timeline.svelte';
  import Taste from './chapters/Taste.svelte';
  import Authors from './chapters/Authors.svelte';
  import PageCounts from './chapters/PageCounts.svelte';
  import Ages from './chapters/Ages.svelte';
  import MountTbr from './chapters/MountTbr.svelte';
  import Personality from './chapters/Personality.svelte';
  import SummaryCard from './chapters/SummaryCard.svelte';
  import PublishGitHub from './chapters/PublishGitHub.svelte';

  let { data } = $props();

  onMount(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.15 }
    );

    document.querySelectorAll('.chapter').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  });
</script>

<div class="portrait">
  <BigPicture stats={data.stats} />
  <Timeline stats={data.stats} />
  <Taste stats={data.stats} />
  <Authors stats={data.stats} />
  <PageCounts stats={data.stats} read={data.read} />
  <Ages stats={data.stats} read={data.read} />
  <MountTbr stats={data.stats} tbr={data.tbr} />
  <Personality stats={data.stats} read={data.read} />
  <SummaryCard {data} />
  <PublishGitHub {data} />
</div>

<style>
  .portrait {
    padding-bottom: 4rem;
  }
</style>
