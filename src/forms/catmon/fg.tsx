import ProductionForm from "../../components/prod-form";

export default function CatmonFGForm() {
  return (
    <ProductionForm
      title="FG Form"
      skuTable="catmon_sku"
      submitTable="catmon_fg"
      skuFilterValue="fg"
      valueField="qty"
      valueLabel="Cases/Bundles"
    />
  );
}
