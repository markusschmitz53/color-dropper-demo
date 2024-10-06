import Header from '../../../components/Header.tsx'

export default function Editor() {
  return (
    <main>
      <Header
        onImageSelect={(image) => console.log(image)}
        pickedColorValue="#fff"
      />
      <section>works</section>
    </main>
  )
}
