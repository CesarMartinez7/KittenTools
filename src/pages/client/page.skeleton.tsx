export default function SkeletonClient () {
    <div className="flex flex-col">
        <SkeletonSidebar/>
        <SkeletonInputRequestButtonRequest/>
        <SkeletonBodyRequestResponseRequest/>
    </div>
}



function SkeletonSidebar(){
    return(
        <div className="h-screen w-[388px] bg-zinc-400 animate-pulse">
            
        </div>
    )
}


function SkeletonBodyRequestResponseRequest () {

}


function SkeletonInputRequestButtonRequest {
    return(
        <div className="">
            <div className="w-[62px] h-[36px] animate-pulse bg-zinc-400"></div>
            <div className="w-[881px] h-[36px] animate-pulse bg-zinc-400"></div>
            <div></div>
        </div>
    )
}