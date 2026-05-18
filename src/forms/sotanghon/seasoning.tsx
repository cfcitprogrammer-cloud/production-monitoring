import ProductionQtyUnitForm from "../../components/prod-unit-form";

export default function SotanghonSeasoningForm() {
  return (
    <ProductionQtyUnitForm
      title="Seasoning Form"
      skuTable="kf_sku"
      submitTable="kf_seasoning"
      skuFilterValue="seasoning"
      units={["weight", "pc"]}
    />
  );
}
