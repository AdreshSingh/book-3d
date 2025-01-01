/* eslint-disable react/prop-types */
/* eslint-disable react/no-unknown-property */
import { useEffect, useMemo, useRef, useState } from 'react';
import { pageAtom, pages } from './UI';
import {
    Bone,
    BoxGeometry,
    Color,
    Float32BufferAttribute,
    MeshStandardMaterial,
    Skeleton,
    SkinnedMesh,
    SRGBColorSpace,
    Uint16BufferAttribute,
    Vector3
} from 'three';
import { useCursor, useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { degToRad, MathUtils } from 'three/src/math/MathUtils.js';
import { useAtom } from 'jotai';
import { easing } from 'maath';



const PAGE_WIDTH = 1.28;
const PAGE_HEIGHT = 1.71; // aspect ratio 4:3
const PAGE_DEPTH = 0.003;
const PAGE_SEGMENTS = 30;
const SEGMENT_WIDTH = PAGE_WIDTH / PAGE_SEGMENTS;

// const lerpFactor = 0.1; control speed of rotation interpolation
const easingFactor = 0.5;
const easingFactorFold = 0.3;
const insideCurveStrength = 0.18;
const outsideCurveStrength = 0.05;
const turningCurveStrength = 0.09;


const pageGeometry = new BoxGeometry(
    PAGE_WIDTH,
    PAGE_HEIGHT,
    PAGE_DEPTH,
    PAGE_SEGMENTS,
    2
);


pageGeometry.translate(PAGE_WIDTH / 2, 0, 0)

const position = pageGeometry.attributes.position;

const vertex = new Vector3();
const skinIndexes = [];
const skinWeights = [];

for (let i = 0; i < position.count; i++) {
    //? ALL VERTICES
    vertex.fromBufferAttribute(position, i); //? get the vertex
    const x = vertex.x;

    const skinIndex = Math.max(0, Math.floor(x / SEGMENT_WIDTH))
    let skinWeight = (x % SEGMENT_WIDTH) / SEGMENT_WIDTH;

    skinIndexes.push(skinIndex, skinIndex + 1, 0, 0)
    skinWeights.push(1 - skinWeight, skinWeight, 0, 0)

}

pageGeometry.setAttribute("skinIndex", new Uint16BufferAttribute(skinIndexes, 4))
pageGeometry.setAttribute("skinWeight", new Float32BufferAttribute(skinWeights, 4))

const whiteColor = new Color("white");
const emissiveColor = new Color("orange");

const pageMaterials = [
    new MeshStandardMaterial({ color: whiteColor }),
    new MeshStandardMaterial({ color: "#111" }),
    new MeshStandardMaterial({ color: whiteColor }),
    new MeshStandardMaterial({ color: whiteColor })
]

pages.forEach((page) => {
    useTexture.preload(`/textures/${page.front}.jpg`),
        useTexture.preload(`/textures/${page.back}.jpg`),
        useTexture.preload("/textures/book-cover-roughness.jpg")
})

const Page = ({ number, front, back, page, opened, bookClosed, ...props }) => {
    const [picture, picture2, pictureRoughness] = useTexture([
        `/textures/${front}.jpg`,
        `/textures/${back}.jpg`,
        ...(number == 0 || number == pages.length - 1 ? ["/textures/book-cover-roughness.jpg"] : [])
    ]);


    const group = useRef();
    const turnedAt = useRef(0)
    const lastOpened = useRef(opened)
    const skinnedMeshRef = useRef();


    picture.colorSpace = picture2.colorSpace = SRGBColorSpace;

    const mannualSkinnedMesh = useMemo(() => {
        const bones = [];
        for (let i = 0; i <= PAGE_SEGMENTS; i++) {
            let bone = new Bone();
            bones.push(bone)

            if (i == 0) {
                bone.position.x = 0;
            } else {
                bone.position.x = SEGMENT_WIDTH;
            }
            if (i > 0) {
                bones[i - 1].add(bone)
            }

        }
        const skeleton = new Skeleton(bones);

        const materials = [
            ...pageMaterials,
            new MeshStandardMaterial({
                color: whiteColor,
                map: picture,
                ...(number === 0 ? {
                    roughnessMap: pictureRoughness
                } : {
                    roughness: 0.1
                }),
                emissive: emissiveColor,
                emissiveIntensity: 0,
            }),
            new MeshStandardMaterial({
                color: whiteColor,
                map: picture2,
                ...(number === pages.length - 1 ? {
                    roughnessMap: pictureRoughness
                } : {
                    roughness: 0.1
                }),
                emissive: emissiveColor,
                emissiveIntensity: 0,
            })
        ];


        const mesh = new SkinnedMesh(pageGeometry, materials);

        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.frustumCulled = false;
        mesh.add(skeleton.bones[0]);
        mesh.bind(skeleton);

        return mesh
    }, [])

    // useHelper(skinnedMeshRef, SkeletonHelper, "red")

    useFrame((_, delta) => {
        if (!skinnedMeshRef.current) return;

        const emissiveIntensity = highLighted ? 0.22 : 0;
        skinnedMeshRef.current.material[4].emissiveIntensity =
            skinnedMeshRef.current.material[5].emissiveIntensity = MathUtils.lerp(
                skinnedMeshRef.current.material[4].emissiveIntensity,
                emissiveIntensity,
                0.1,
            );

        if (lastOpened.current !== opened) {
            turnedAt.current = +new Date();
            lastOpened.current = opened;
        }

        let turningTime = Math.min(400, new Date() - turnedAt.current) / 400;
        turningTime = Math.sin(turningTime * Math.PI);


        let targetRotation = opened ? - Math.PI / 2 : Math.PI / 2;
        if (!bookClosed) {
            targetRotation += degToRad(number * 0.8)
        }

        const bones = skinnedMeshRef.current.skeleton.bones;
        // does not have animation
        // bones[0].rotation.y = MathUtils.lerp(bones[0].rotation.y, targetRotation, lerpFactor);

        for (let i = 0; i < bones.length; i++) {
            const target = i === 0 ? group.current : bones[i];

            const insideCurveIntensity = i < 8 ? Math.sin(i * 0.2 + 0.25) : (0);
            const outsideCurveIntensity = i >= 8 ? Math.cos(i * 0.3 + 0.09) : 0;
            const turingIntensity = Math.sin(i * Math.PI * (1 / bones.length)) * turningTime;

            let rotationAngle = insideCurveStrength * insideCurveIntensity * targetRotation - outsideCurveIntensity * outsideCurveStrength * targetRotation + turningCurveStrength * turingIntensity * targetRotation;

            let foldRotationAngle = degToRad(Math.sin(targetRotation) * 2)

            if (bookClosed) {
                if (i === 0) {
                    rotationAngle = targetRotation;
                    foldRotationAngle = 0;
                } else {
                    rotationAngle = 0;
                    foldRotationAngle = 0;
                }
            }

            // cool animated way to rotate
            easing.dampAngle(
                target.rotation,
                "y",
                rotationAngle,
                easingFactor,
                delta
            );

            const foldIntensity = i > 8 ? Math.sin(i * Math.PI * (1 / bones.length) - 0.5) * turningTime : 0;

            easing.dampAngle(target.rotation,
                "x",
                foldRotationAngle * foldIntensity,
                easingFactorFold,
                delta)
        }
    });

    const [highLighted, setHighLighted] = useState(false)
    useCursor(highLighted)
    const [_, setPage] = useAtom(pageAtom)

    return (
        <group {...props}
            ref={group}
            onPointerEnter={
                (e) => {
                    e.stopPropagation()
                    setHighLighted(true)
                }
            }
            onPointerLeave={
                (e) => {
                    e.stopPropagation()
                    setHighLighted(false)
                }
            }
            onClick={
                (e) => {
                    e.stopPropagation()
                    setPage(opened ? number : number + 1)
                    setHighLighted(false)
                }
            }

        >
            <primitive
                object={mannualSkinnedMesh}
                ref={skinnedMeshRef}
                position-z={-number * PAGE_DEPTH + page * PAGE_DEPTH}
            />
        </group>
    )
}

export function Book({ ...props }) {
    const [page] = useAtom(pageAtom);
    const [delayedPage, setDelayedPage] = useState(page)


    useEffect(() => {
        let timeout;
        const goToPage = () => {
            setDelayedPage((delayedPage) => {
                if (page === delayedPage) {
                    return delayedPage;
                } else {
                    timeout = setTimeout(
                        () => {
                            goToPage();
                        },
                        Math.abs(page - delayedPage) > 2 ? 50 : 150
                    );
                    if (page > delayedPage) {
                        return delayedPage + 1;
                    }
                    if (page < delayedPage) {
                        return delayedPage - 1;
                    }
                }
            });
        };
        goToPage();
        return () => {
            clearTimeout(timeout);
        };
    }, [page]);



    return (
        <group {...props}>
            {
                [...pages].map((pageData, index) => (
                    (
                        <Page
                            key={index}
                            page={delayedPage}
                            number={index}
                            opened={delayedPage > index}
                            bookClosed={delayedPage === 0 || delayedPage === pages.length}
                            // position-y={index * 0.2}
                            {...pageData}
                        />
                    )
                ))
            }
        </group>
    )
}