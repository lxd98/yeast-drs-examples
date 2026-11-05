Yeast DRS - 50-gene example browser

Open index.html locally, or serve this entire directory as a static website.
Keep assets/ and genes/ alongside index.html. A modern browser supporting
DecompressionStream is required (tested in Chrome). No server-side analysis,
BAM, POD5 or internet connection is required to use the local copy.

This is a selected software demonstration, not the complete benchmark and not
a representative biological sample. It includes 50 non-overlapping mono-exon
genes, all 16 nuclear chromosomes and 25 genes on each strand. Cached read
selections and alignments were copied without rerunning biological analysis.

Group1 - Ends within CDS: the aligned 3-prime end is before the annotated
coding-region 3-prime boundary, with no CIGAR N overlapping the gene.
Group2 - Reaches or passes CDS end: the aligned 3-prime end reaches that boundary
or extends downstream, with no gene-overlapping N.
Uncertain - Unexpected splice gap: a CIGAR N overlaps the annotated mono-exon gene.
These categories do not establish complete transcripts or validated isoforms.

The six panels can be shown/hidden independently. All share genomic zoom;
Reset scale restores the cached gene window. Show group filters the reads.
Every retained read is accessible by scrolling, with details loaded on demand.
Coverage/density defaults to all retained reads; select Filtered reads to update
those tracks to the filtered cohort. Reference and database markers stay fixed.

Coordinates are 1-based inclusive. Transcription runs toward higher coordinates
on the plus strand and lower coordinates on the minus strand. Coding start/stop
landmarks are not UTR endpoint definitions. Qualified database APA positions
are separate, retaining the existing minimum support of 3 TIF counts.
Positive poly(A) estimates and zero/-1/missing tags remain distinct categories.

Full-cohort density curves use R stats::density, adjust=1, n=4096. Filtered KDE
uses Gaussian kernels with R's bw.nrd0 rule and type-7 quartiles. Density is per
nucleotide. Coverage excludes CIGAR N/D gaps. Alignment blocks and metadata are
compressed and loaded from local files; read records are not downsampled.

This package contains no candidate-isoform PDFs, manuscript notes, original
analysis directories, or links to the full collection. Only the 50 indexed gene
views are included. Nothing is published simply by creating this folder.
