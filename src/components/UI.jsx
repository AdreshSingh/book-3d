import { atom, useAtom } from "jotai";
import { useEffect } from "react";

const pictures = [
  "DSC00680",
  "DSC00933",
  "DSC00966",
  "DSC00983",
  "DSC01011",
  "DSC01040",
  "DSC01064",
  "DSC01071",
  "DSC01103",
  "DSC01145",
  "DSC01420",
  "DSC01461",
  "DSC01489",
  "DSC02031",
  "DSC02064",
  "DSC02069",
];

export const pageAtom = atom(0);
export const pages = [
  {
    front: "book-cover",
    back: pictures[0],
  },
];
for (let i = 1; i < pictures.length - 1; i += 2) {
  pages.push({
    front: pictures[i % pictures.length],
    back: pictures[(i + 1) % pictures.length],
  });
}

pages.push({
  front: pictures[pictures.length - 1],
  back: "book-back",
});

export const UI = () => {
  const [page, setPage] = useAtom(pageAtom);

  useEffect(() => {
    const audio = new Audio("/audios/page-flip-01a.mp3")
    audio.play()
  })

  return (
    <>
      <main className="fixed inset-0 z-10 flex flex-col justify-between pointer-events-none select-none">
        <a
          className="mt-10 ml-10 pointer-events-auto"
          href="https://lessons.wawasensei.dev/courses/react-three-fiber"
        >
          <img className="w-20" src="/images/all4one.png" />
        </a>
        <div className="flex justify-center w-full overflow-auto pointer-events-auto">
          <div className="flex items-center max-w-full gap-4 p-10 overflow-auto">
            {[...pages].map((_, index) => (
              <button
                key={index}
                className={`border-transparent hover:border-white transition-all duration-300  px-4 py-3 rounded-full  text-lg uppercase shrink-0 border ${index === page
                  ? "bg-white/90 text-black"
                  : "bg-black/30 text-white"
                  }`}
                onClick={() => setPage(index)}
              >
                {index === 0 ? "Cover" : `Page ${index}`}
              </button>
            ))}
            <button
              className={`border-transparent hover:border-white transition-all duration-300  px-4 py-3 rounded-full  text-lg uppercase shrink-0 border ${page === pages.length
                ? "bg-white/90 text-black"
                : "bg-black/30 text-white"
                }`}
              onClick={() => setPage(pages.length)}
            >
              Back Cover
            </button>
          </div>
        </div>
      </main>

      <div className="fixed inset-0 flex items-center select-none -rotate-2">
        <div className="relative">
          <div className="flex items-center gap-8 px-8 bg-white/0 animate-horizontal-scroll w-max">
            <h1 className="font-black text-white shrink-0 text-10xl ">
              HappY
            </h1>
            <h2 className="italic font-light text-white shrink-0 text-8xl">
              NeW
            </h2>
            <h2 className="font-bold text-white shrink-0 text-12xl">
              YeAr
            </h2>
            <h2 className="italic font-bold text-transparent shrink-0 text-12xl outline-text">
              2025
            </h2>
            <h2 className="font-medium text-white shrink-0 text-9xl">
              Wishing You
            </h2>
            <h2 className="italic text-white shrink-0 text-9xl font-extralight">
              A HappY
            </h2>
            <h2 className="font-bold text-white shrink-0 text-13xl">
              & BlissFul Year
            </h2>
            <h2 className="italic font-bold text-transparent shrink-0 text-13xl outline-text">
              ✨🎇🌟🎉
            </h2>
          </div>
          <div className="absolute top-0 left-0 flex items-center gap-8 px-8 bg-white/0 animate-horizontal-scroll-2 w-max">
            <h1 className="font-black text-white shrink-0 text-10xl ">
              HappY
            </h1>
            <h2 className="italic font-light text-white shrink-0 text-8xl">
              NeW
            </h2>
            <h2 className="font-bold text-white shrink-0 text-12xl">
              YeAr
            </h2>
            <h2 className="italic font-bold text-transparent shrink-0 text-12xl outline-text">
              2025
            </h2>
            <h2 className="font-medium text-white shrink-0 text-9xl">
              Wishing You
            </h2>
            <h2 className="italic text-white shrink-0 text-9xl font-extralight">
              A HappY
            </h2>
            <h2 className="font-bold text-white shrink-0 text-13xl">
              & BlissFul Year
            </h2>
            <h2 className="italic font-bold text-transparent shrink-0 text-13xl outline-text">
              ✨🎇🌟🎉
            </h2>
          </div>
        </div>
      </div>
    </>
  );
};
