import ProductionForm from "../../components/prod-form";

export default function CatmonPackingForm() {
  return (
    <ProductionForm
      title="Packing Form"
      skuTable="catmon_sku"
      submitTable="catmon_packing"
      skuFilterValue="packing"
      valueField="qty"
      valueLabel="Quantity"
    />
  );
}
