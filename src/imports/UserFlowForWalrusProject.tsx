import svgPaths from "./svg-cxmf3se5in";
import imgImageWalrus from "figma:asset/48afb81081c77536207aba03b30820a191959732.png";

function SearchLanding() {
  return (
    <div className="h-[60px] relative shrink-0 w-full" data-name="SearchLanding">
      <p className="absolute font-['Inter:Regular',_sans-serif] font-normal leading-[60px] left-[384.61px] not-italic text-[60px] text-center text-neutral-950 text-nowrap top-[0.5px] tracking-[0.2637px] translate-x-[-50%] whitespace-pre">Fund The Walrus-Site!!</p>
    </div>
  );
}

function SearchLanding1() {
  return (
    <div className="h-[28px] relative shrink-0 w-full" data-name="SearchLanding">
      <p className="absolute font-['Inter:Regular',_sans-serif] font-normal leading-[28px] left-[384.06px] not-italic text-[#717182] text-[20px] text-center text-nowrap top-0 tracking-[-0.4492px] translate-x-[-50%] whitespace-pre">Experience smooth, dynamic animations that bring your search to life</p>
    </div>
  );
}

function Container() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] h-[104px] items-start relative shrink-0 w-full" data-name="Container">
      <SearchLanding />
      <SearchLanding1 />
    </div>
  );
}

function TextInput() {
  return (
    <div className="basis-0 grow h-[48px] min-h-px min-w-px relative shrink-0" data-name="Text Input">
      <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-[48px] items-center px-[24px] py-[12px] relative w-full">
          <p className="font-['Inter:Regular',_sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[16px] text-[rgba(10,10,10,0.5)] text-nowrap tracking-[-0.3125px] whitespace-pre">Search for anything...</p>
        </div>
      </div>
    </div>
  );
}

function Icon() {
  return (
    <div className="absolute left-[16px] size-[16px] top-[12px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d="M14 14L11.1066 11.1067" id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p107a080} id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Button() {
  return (
    <div className="bg-[#030213] h-[40px] relative rounded-[1.67772e+07px] shrink-0 w-[102.031px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[40px] relative w-[102.031px]">
        <Icon />
        <p className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[20px] left-[40px] not-italic text-[14px] text-nowrap text-white top-[10.5px] tracking-[-0.1504px] whitespace-pre">Search</p>
      </div>
    </div>
  );
}

function Form() {
  return (
    <div className="bg-white h-[66px] relative rounded-[1.67772e+07px] shrink-0 w-full" data-name="Form">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[1.67772e+07px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)]" />
      <div className="flex flex-row items-center size-full">
        <div className="box-border content-stretch flex gap-[12px] h-[66px] items-center px-[9px] py-px relative w-full">
          <TextInput />
          <Button />
        </div>
      </div>
    </div>
  );
}

function Paragraph() {
  return (
    <div className="h-[24px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',_sans-serif] font-normal leading-[24px] left-[384.59px] not-italic text-[#717182] text-[16px] text-center text-nowrap top-[-0.5px] tracking-[-0.3125px] translate-x-[-50%] whitespace-pre">Click the search bar to see the wave animation in action</p>
    </div>
  );
}

function SearchLanding2() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[32px] h-[258px] items-start left-[230px] top-[302.5px] w-[768px]" data-name="SearchLanding">
      <Container />
      <Form />
      <Paragraph />
    </div>
  );
}

function Container1() {
  return <div className="absolute h-[733px] left-0 top-0 w-[1228px]" data-name="Container" />;
}

function Container2() {
  return <div className="absolute blur-[96px] filter left-[246.25px] rounded-[1.67772e+07px] size-[800px] top-[-394.54px]" data-name="Container" style={{ backgroundImage: "url('data:image/svg+xml;utf8,<svg viewBox=\\\'0 0 800 800\\\' xmlns=\\\'http://www.w3.org/2000/svg\\\' preserveAspectRatio=\\\'none\\\'><rect x=\\\'0\\\' y=\\\'0\\\' height=\\\'100%\\\' width=\\\'100%\\\' fill=\\\'url(%23grad)\\\' opacity=\\\'1\\\'/><defs><radialGradient id=\\\'grad\\\' gradientUnits=\\\'userSpaceOnUse\\\' cx=\\\'0\\\' cy=\\\'0\\\' r=\\\'10\\\' gradientTransform=\\\'matrix(0 -56.569 -56.569 0 400 400)\\\'><stop stop-color=\\\'rgba(139,92,246,0.35)\\\' offset=\\\'0\\\'/><stop stop-color=\\\'rgba(70,46,123,0.175)\\\' offset=\\\'0.35\\\'/><stop stop-color=\\\'rgba(0,0,0,0)\\\' offset=\\\'0.7\\\'/></radialGradient></defs></svg>')" }} />;
}

function Container3() {
  return <div className="absolute blur-[84px] filter left-[-184.69px] rounded-[1.67772e+07px] size-[600px] top-[-295.91px]" data-name="Container" style={{ backgroundImage: "url('data:image/svg+xml;utf8,<svg viewBox=\\\'0 0 600 600\\\' xmlns=\\\'http://www.w3.org/2000/svg\\\' preserveAspectRatio=\\\'none\\\'><rect x=\\\'0\\\' y=\\\'0\\\' height=\\\'100%\\\' width=\\\'100%\\\' fill=\\\'url(%23grad)\\\' opacity=\\\'1\\\'/><defs><radialGradient id=\\\'grad\\\' gradientUnits=\\\'userSpaceOnUse\\\' cx=\\\'0\\\' cy=\\\'0\\\' r=\\\'10\\\' gradientTransform=\\\'matrix(0 -42.426 -42.426 0 300 300)\\\'><stop stop-color=\\\'rgba(59,130,246,0.32)\\\' offset=\\\'0\\\'/><stop stop-color=\\\'rgba(30,65,123,0.16)\\\' offset=\\\'0.35\\\'/><stop stop-color=\\\'rgba(0,0,0,0)\\\' offset=\\\'0.7\\\'/></radialGradient></defs></svg>')" }} />;
}

function Container4() {
  return <div className="absolute blur-[88px] filter left-[215.47px] rounded-[1.67772e+07px] size-[700px] top-[345.23px]" data-name="Container" style={{ backgroundImage: "url('data:image/svg+xml;utf8,<svg viewBox=\\\'0 0 700 700\\\' xmlns=\\\'http://www.w3.org/2000/svg\\\' preserveAspectRatio=\\\'none\\\'><rect x=\\\'0\\\' y=\\\'0\\\' height=\\\'100%\\\' width=\\\'100%\\\' fill=\\\'url(%23grad)\\\' opacity=\\\'1\\\'/><defs><radialGradient id=\\\'grad\\\' gradientUnits=\\\'userSpaceOnUse\\\' cx=\\\'0\\\' cy=\\\'0\\\' r=\\\'10\\\' gradientTransform=\\\'matrix(0 -49.497 -49.497 0 350 350)\\\'><stop stop-color=\\\'rgba(16,185,129,0.28)\\\' offset=\\\'0\\\'/><stop stop-color=\\\'rgba(8,93,65,0.14)\\\' offset=\\\'0.35\\\'/><stop stop-color=\\\'rgba(0,0,0,0)\\\' offset=\\\'0.7\\\'/></radialGradient></defs></svg>')" }} />;
}

function AnimatedBackground() {
  return (
    <div className="absolute h-[733px] left-0 overflow-clip top-0 w-[1228px]" data-name="AnimatedBackground">
      <Container1 />
      <Container2 />
      <Container3 />
      <Container4 />
    </div>
  );
}

function ImageWalrus() {
  return (
    <div className="relative shrink-0 size-[32px]" data-name="Image (Walrus)">
      <img alt="" className="absolute bg-clip-padding border-0 border-[transparent] border-solid box-border inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgImageWalrus} />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border size-[32px]" />
    </div>
  );
}

function Link() {
  return (
    <div className="h-[24px] relative shrink-0 w-[63.148px]" data-name="Link">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[24px] relative w-[63.148px]">
        <p className="absolute font-['Inter:Regular',_sans-serif] font-normal leading-[24px] left-0 not-italic text-[16px] text-[rgba(10,10,10,0.8)] text-nowrap top-[-0.5px] tracking-[-0.3125px] whitespace-pre">Features</p>
      </div>
    </div>
  );
}

function Link1() {
  return (
    <div className="h-[24px] relative shrink-0 w-[50.016px]" data-name="Link">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[24px] relative w-[50.016px]">
        <p className="absolute font-['Inter:Regular',_sans-serif] font-normal leading-[24px] left-0 not-italic text-[16px] text-[rgba(10,10,10,0.8)] text-nowrap top-[-0.5px] tracking-[-0.3125px] whitespace-pre">Pricing</p>
      </div>
    </div>
  );
}

function Link2() {
  return (
    <div className="h-[24px] relative shrink-0 w-[43.648px]" data-name="Link">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[24px] relative w-[43.648px]">
        <p className="absolute font-['Inter:Regular',_sans-serif] font-normal leading-[24px] left-0 not-italic text-[16px] text-[rgba(10,10,10,0.8)] text-nowrap top-[-0.5px] tracking-[-0.3125px] whitespace-pre">About</p>
      </div>
    </div>
  );
}

function Link3() {
  return (
    <div className="basis-0 grow h-[24px] min-h-px min-w-px relative shrink-0" data-name="Link">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[24px] relative w-full">
        <p className="absolute font-['Inter:Regular',_sans-serif] font-normal leading-[24px] left-0 not-italic text-[16px] text-[rgba(10,10,10,0.8)] text-nowrap top-[-0.5px] tracking-[-0.3125px] whitespace-pre">Testimonials</p>
      </div>
    </div>
  );
}

function Navigation() {
  return (
    <div className="h-[24px] relative shrink-0 w-[342.758px]" data-name="Navigation">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[32px] h-[24px] items-center relative w-[342.758px]">
        <Link />
        <Link1 />
        <Link2 />
        <Link3 />
      </div>
    </div>
  );
}

function Icon1() {
  return (
    <div className="absolute left-[12px] size-[16px] top-[10px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d={svgPaths.p2949e900} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p22e64900} id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Button1() {
  return (
    <div className="bg-[#0b7285] h-[36px] relative rounded-[8px] shrink-0 w-[116.289px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[36px] relative w-[116.289px]">
        <Icon1 />
        <p className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[20px] left-[36px] not-italic text-[14px] text-nowrap text-white top-[8.5px] tracking-[-0.1504px] whitespace-pre">CONNECT</p>
      </div>
    </div>
  );
}

function Container5() {
  return (
    <div className="content-stretch flex h-[64px] items-center justify-between relative shrink-0 w-full" data-name="Container">
      <ImageWalrus />
      <Navigation />
      <Button1 />
    </div>
  );
}

function TopBar() {
  return (
    <div className="absolute bg-[rgba(255,255,255,0.8)] box-border content-stretch flex flex-col h-[65px] items-start left-0 pb-px pt-0 px-[118px] top-0 w-[1228px]" data-name="TopBar">
      <div aria-hidden="true" className="absolute border-[0px_0px_1px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none" />
      <Container5 />
    </div>
  );
}

export default function UserFlowForWalrusProject() {
  return (
    <div className="bg-white relative size-full" data-name="User Flow for Walrus Project">
      <SearchLanding2 />
      <AnimatedBackground />
      <TopBar />
    </div>
  );
}