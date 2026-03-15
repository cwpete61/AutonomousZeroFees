import { Module } from "@nestjs/common";
import { MerchantLeadMonsterController } from "./merchant-lead-monster.controller";
import { MerchantLeadMonsterService } from "./merchant-lead-monster.service";

@Module({
  controllers: [MerchantLeadMonsterController],
  providers: [MerchantLeadMonsterService],
})
export class MerchantLeadMonsterModule {}
