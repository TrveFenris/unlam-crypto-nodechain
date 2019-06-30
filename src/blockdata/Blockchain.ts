import { Transaction } from './Transaction';
import { Block } from './Block';
import { sha256 } from 'js-sha256';
import fetch from 'node-fetch';

export type Chain = Array<Block>;
type NetworkNode = string;

export class Blockchain {

  private chain: Chain = [];
  private currentTransactions: Array<Transaction> = [];
  private nodes: Set<NetworkNode> = new Set();

  constructor() {
    this.genesis();
  }

  private genesis = () => {
    this.chain.push({
      header: {
        index: 0,
        prevBlockHash: '',
        timestamp: Date.now(),
      },
      transactions: [],
      proof: 100,
    });
  };

  getChain = (): Chain => this.chain.slice();

  getLastBlock = (): Block => this.chain[this.chain.length - 1];

  addTransaction = (tx: Transaction): number => {
    this.currentTransactions.push(tx);
    return this.chain.length;
  };

  addBlock = (proof: number): Block => {
    const block: Block = {
      header: {
        index: this.chain.length,
        prevBlockHash: sha256(JSON.stringify(this.getLastBlock())),
        timestamp: Date.now(),
      },
      transactions: this.currentTransactions.slice(),
      proof: proof,
    };
    this.currentTransactions = [];
    this.chain.push(block);
    return block;
  };

  private static validateProof = (
    lastProof: number,
    proof: number
  ): boolean => {
    let guessHash = sha256(`${lastProof}${proof}`);
    return guessHash.startsWith('0000');
  };

  proofOfWork = (lastProof: number): number => {
    let proof = 0;
    while (!Blockchain.validateProof(lastProof, proof)) {
      proof += 1;
    }
    return proof;
  };

  registerNode = (nodeAddr: NetworkNode): void => {
    this.nodes.add(nodeAddr);
  };

  public static validateChain = (chain: Chain): boolean => {
    let result = true;
    let lastBlock: Block = chain[0];
    let currentIndex = 1;
    while (currentIndex < chain.length) {
      const currentBlock: Block = chain[currentIndex];
      const jsonBlock = JSON.stringify(lastBlock);
      const lastBlockHash = sha256(jsonBlock);
      if (
        currentBlock.header.prevBlockHash != lastBlockHash ||
        !Blockchain.validateProof(lastBlock.proof, currentBlock.proof)
      ) {
        result = false;
      }
      lastBlock = currentBlock;
      currentIndex++;
    }
    return result;
  };

  resolveConsensus = (): Promise<any[]> => {
    const urls = Array.from(this.nodes).map(
      node => `http://${node}/api/v1/chain`
    );
    return Promise.all(
      urls.map(url =>
        fetch(url)
          .then(response => response.json())
          .catch(reason => {
            console.log({ reason });
          })
      )
    ).then(data => data);
  };

  replaceChain = (newChain: Chain) => {
    this.chain = newChain.slice()
  }

  alterOwnBlocks() {
    this.chain.forEach(function (block) {
      block.transactions.forEach(function (tx) {
        tx.sender = "X";
        tx.recipient = "X";
        tx.image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAAkFBMVEX///8BAAIBAAEAAAD8/Pz4+Pjy8vL5+fns7OzS0tL19fXx8fGCgoPh4eHLy8uenp7AwMDj4+Pa2tqKiorMzMwxMTGlpaW9vb2ysrJwcHAfHx9VVVUoKChqamqYmJhDQ0R5eXk5OTlcXFwPDxAWFhZMTEwvLy8+Pj6QkJCqqquGhod9fX1hYWFXV1caGhu0tLUCCR3LAAAS5klEQVR4nN0diZaqOkwJKqCyuYILKi446vj/f/dAZRFpm0IZri/vnHlzdawNSbMnbbW4QJZ7nY6iztfOyfX3h5Ha4fv8Pwy9rmJZqmlcdts2ZOA005reWlWQ+5at6ndjcPXcGC1Jaof/RT/Cf/woTW+xCsjqfX25Ho5Sgls7DwCbL0ZRH3j7hGwJ3Z4/kt8Bgl7TGy0JHWObsmSbiKEEy1nTWy0H2k9Ing+mLICQT/tNb7YMdEaPY/dJss8XwDWb3m0ZmOEI+CTitOndlgDlBiSSfb4Aly9kUxNPwpCIO6vp/XJDZwNkkn3S8GQ3vWFu6J64MHS/D0OlzcGkoajRm94wNyjARUO4N71hblB4BE1IxPXXGW59l4eGbQi+zk/UDlxc+vt9Ro224pI0t+/Th/Kai4bH79MWrRGftjC+TtIEXNqiDdtv8/MvfMoiJKLa9Ja5IDyEQCPZJw0lMJreNBfcI2XIieG16U3zgH0oCKmx2HQpN71tPDx4lJuG8EVGzXDHT8JQ1HyRMNUnwCBZIQ2/CcOH0R1FSv+vGKqPODD42yUHtwJ0m943Hvo/IX7L21p1sPHSiIb7L5KlLWsaGLPh03JD0/DU9K754EmP6Z6Dhk7DWy4F5gSNIcC86d2Wge4CLWrA/z4XOIKfjAtFV5Bw+c5ct+oiRU098VJZ7vU6HU3Tut2upnV6cg3i+vpwotg0hIU4JpU1xbJsW9XN+dRYr4OfwWXjbC6jtTGdz0zdti1FIL+oyBSpfxbxeLuWqs/OxmizWniTXyiGpbfbBNO7bgvKdm0AQUMAp6LJptghwYLN9TDZv6Hz9j0gZd45LjbruS7AUrQ8QGC4rRAt7Y/PgbM7bN1MuQdF776M4Ae4291gXhlJBJ8CjMqtLavTwc47/koJajzw/JTrOfdqnql8zjNL/tlCGXNGts+XQ3rU8D5MXsRF8LuqFK3V1j714QJnhKbXVVTj5qdHrSI8kdzpFeRrx3DzsdPM8wwXxzNJT7F147oEmu/JR8OUlLtZ+RPZOy9JgZvwHIyQC8uWOluvJnmmFIPhw2G/mqXj7rJ+LRQD4aPz5qhVO+o8WD1rGvlDQEgIz2NQ/jxaxhI+wvzhKxsVoekVc+14vxnilSQT683wgR/OpY+jbP8skwq+WLpfEcfbmjqHpS9CpODIeKmgH7XZLWtubH+GLPrJ45H3UnaCyESn4UPiVLOQNXN9We12102QFVyhqayeQxN5qg/7GbmqLhLTSxgS7KUAfNHpaMVeHxLCTpz5MOZcJfD+hjc/WFVoXYgyc/zEmHza/qNxbPXbgyVFk9ZDw4fAEVfuKpsRftL7EwR3oL9UiDbbNUBFgRW9/dGkwGiNpNBo+PoTa81Q8DXQMHzKVZydDFgLwjkLXz7EZ6ETCZy/pmL4/SIqJ6LgP+lRhu9cYmNHCf5OW6TfL6Au21zSAnEhr04STtE9riSPAAzDrzeqxlX0E8PCDBXTOn6OymVfnz1K+vqK0T9799aAQTjwTnIaphNs6FUMDcNvP1SKyHU3GPERHvhEbJt/rTcAzlUwPONkR6gbjdiOsy+ACGqJo2GoFSsImyG6NBMgMfa7xr5m7ymHYdkAWQQrvNwIfaxY+7fm+z/l1AqVaCo1pvnxKE9JQZg6+fhkfTRsh8K8LIYHvgJpcBN5oxz+kIoS3EoSUfU/bFH6gwc/SZ/2HVY1kjgaSuBypG0VW9f18fBhiaE0xRtkJHf3x/8zKgIMkIZN6No7h+3xeNr9hL694gH3gwdpGn9XN9hXiSamUXIM8yxQBnjoBG4TJ3650udLfgwl2Cd24jOIXhJD2J+2EcQii/HXLsZR7D+CbAndYTIpw2YRiskjW5cXN3DVlAeglgBMG0gk/bKCpTjqyRYPErRTK8qgmEQMqqyeK3RQNJQQPXXW8iNKXdJJkLIFKTy1SO9UeaWBNGRy+sgqztZOmBww8s1shGgkkTJqDBqmGKJoCKxwxkCoywP7xGfrjbLihp9Lu1gMGV0S+l6s7so0nnR/yjBqeLASGqKCsaxoxkq02wq7xI5SnOIwD2WpSMy9TE15FlwnrHh69IkF1XBTT6LND4BNEvcf8tbLAxyNJKLeCrXGI5HC+MyEKkx5ahORbyZECGHsFrnEpKVCZII8PWT1RmvtiWjoD1sUCDgqaLFvZqzwqOMfvVTohBWGlgwGhtReHpm3NQjHa176nXi1KGW8zCx0HDqrM3IYlxpoGEXgUvHmfCYFipciBQeHDC5t0+NRpQQ6EyDTIhWVXGFAgkHxFtcMacXox1qTtHIVGkYOcUqPGdXPSCnhp0KmZ5vmOJYfS5abAgHNRZwd63FWYZt8RQd3FGGT7PN+9SaTrbdaR2pgzPw0/NAwVA610DCUcEHyHcMbIjCZMS/niQs8GSjhOWZ9MR3D1rpdTyge/FQwzpbs4HKmijy2Yx5Y/rDDBTCiYtgXbtS8WCdbKobgUzjGGA4zfyxhLNMXhnKnI7fkT8hG70XSMPT405E9oTxlJXlS26vPm4p8YigrprE2iqBCvIEKoUWcWlMGW1y4CZdyNyg/40Pa0NxAIbRrOYdRTGOdnA9ty6ovBUi8LuUCPHaIlAYW+uq1CMMKSFDflMBLA3131vdkAyD9+wnwZ+fNye+efws4oK6in9DJSIUNU6DBLiMRlfMWXSeXs7yH19SnfP0PfPcXFS/gfhP8lIgqy9POuwgz753BKDR8jwlrgZuz80KXtS5pA4OEiB3mmJGPVvH7zkVFMZZ5D3h+eg/xRG7ntZ6UWNY5NVknKzS9c2l5+X71EVGM7YePP37Pt4d2Q8s81lJIkbXdlB2TiPBRbm0Fv2xboSBOM9xkSQah2yKvJVb9Xak3wU9ah6OeB+Zfb/JpFm3us6y2rDOaPs9sT16EYTSNp46kX9ZRVLfMMgaAwzQf/JyzOmyyEjvzaII0kv/AsNX9rYVPYZJ8Z/eCMDFhf8t77KOSQYypH5uKTwxbNm1Ca1kavqnjOaJQ41GjO32TOP38dIT332E/LsawNY9bK18YRtFv8VTM9hPZqOKACEl3bWU0B31CJ2Xa4fyl52MM5blbPq1JfBO2icLobXCZiAjHo5EKSGtLS9TBlRwQni8hi2GrM10yolplMEzTpi3Dx9pOIY5pK1f/QsEw3D1l0sP8EaRJMGxpU54hEjgI2TQRdeaEY7wBLOKdP/QM+e9ok2Ple4hiSsOQj0LOFUxDKRMejoNCqKUyiuZOaRKDJT19eA/5MoNhS9aFV23BPhX/K+riUq5ePmkJNCUKDVnF0POoWSkbilU8gmsWEbsUDWGUKPGA1skpAWSj2xIs4o/NKPXHsGHVmM6WkAs2B25xpUL4YikWzlS83D9LrdK/htXFz6QLAS4JGcgYZhNdRBT9fDh97Cw/vc/Q2nBGpTg4M1JyTLGjI//wftu/nMKo3yHWAhrFqoEjopxmmj6seMn7avmi4+tphf/yDC0qySxBw7TiXHHJNIRtKHOV6auFEfxbkhewDsTjAbjKPeMzZqyYQdrpFMFhHbUhWstSREyvHSCri9CAfuxC0c/BxbkE81SP62TWyZ8wAnSKevB6tmlsnq3Yy9vgbj+lxZ0Qi6DKfzgkZo1HpGEmiNHrK0pmR70V2Q7B1XwRode3hrat2kMlsRq0S5kpaL/J5hdkauxI7DYnk1CCrfDRVarPW13RzpYRXUk0BCCN3RhS/EP4ECHV4VEjw4mhBKNYZzlEDPeE7hCb5uPXMl9NLyFsYBfHGRzShyVwzwW71e5USzkunxIK/Qt34aIEp3jzK4q2gJs5fI9H9McXaqytpomqd+xQosyj3sei/0r5bCi1F8FdHcayQ5kPjnQTI7XrhEI0F5SXhklUekedMBLiuPd2zutxnFkxb5GtslnoOQWeOgvD2G470GeoPM2ZF+utWREB8Gqa47jmL5FOXD2MCxxjaLDq2WBa05RDfcJLw3astvpLBg0fpEkwpK8NHrWerQJ0+Qf0xlLdZsfo2xKShnVefHPF1nGlNHwVxU5p/mFCw5dYmlJpKCEbLUrBhh/Dw/OTK8a0psfvMFMjsEdUDMGvcfY2vyMM24dMsFGVLbD1HkA1niQxzeoEOHO2fUlx8vPsImvTXyUUlLVBCljbLAOyErlTtsGtLsB/uJelWzAKVhQ65F9WdOOyWnjHX/8J/OdwH2FYaCsU0BDxgjBBqvXt6WoLeeCf5v6YQBxV8Iki4UEEeor9DEglscXyDx5+IwxVr3IbdHJSBTgV1mxzfAvRVsLQjTCMZjQIwRBgUxm//myFKgvEMtUDQ57EDH25ZWVNoTouTy83UltEBR8iaCjA5DY9wekZOAmkoQSrqppi5pbrsKTQ8OGMm1shNIRl1YHGZrE5UQnDTbTwWIgsra4Kbf44DJuvHpuymFVRCIDKPCpfS7VFUh/8S31pImwamFTl0XsNZYpxv0+57Fxuqao82iGWK1d68E9HAOlbUNlhU/XiMFrZQ4Un/zQjcf4hdaFJ5UzMjdg2UImGr1uGdhgfn/Jmvhy4BERZiVowfB5ETJyG8qaIEDC/c4vkrp/H8v1SOeRkEV/A7X0bwQOck6f/8ucGFWgI/qh6OnRIztFWg1cYg/dy17clMuUA5WF2LDuug0XDuAN2VLZiHuAqIjIzlWrD8HkQW8qxXD15+YFQ7yAwGJbnscPLpeO67Tz9OHhCrgjtb7JVQiJpmJYQaiN2B8XHCwA7MXegDkUY/yQixNPxrCsvFQF8ZnkeElRPfI1wTEPYxaLePmBu8Eh/ACwDUVUz4y2rt79UX99zn+ncX/3EmiHw/my2c2E3S+rk1vXs/S8QRb0zgGS1NFekb3mqoW+kboMSYBLnXQK4h+smOM9MU9fHqqrrpjmbR1f+3CaZJAqFhlL2Kh4brXfD8yvyprAZcd5QZDH1u533IJ7c07r9vqI7KIK+OecWe+xM+zlYzRR692mEIYmGtGRWZxzskjuOSAfzfbBad5QtYCV8J0gDwdUWJjHNjqnj1CxFMyknLNsWHIK+8GlkjKo+HeGlCLRziCsCpAWb8uP+FWPhQ3GiLuKFrSP6AoTWY343EUPkdUi0thi45hoFLSPqg823AESv7BdBHffYUaS4hLXsVRqbfubEhrPR4V31RMpoEdxrStKrB6ImBg+plQpKUVLmKxhCotn62TkcY+SOt8F5PKztokWbnKQFF3lnRjQrhbjIvtD6kvuKZatj3dTtoaV067ywVnHINMReHW/vaSWkpecai4KA3PiDvh1wQWuLgaZvFJ6SQ23ofMGZUshANxz+Au7kYUDoxKtGK3uFScNXe9M6dRGzXp9Aa9lu/CR2VpQuMR/Jpjb1Gr5DXUWhSAjIvYyITr8ndKjl6nWWFGJg5pJj3ugyHTMnkbNLQZ1loRjQyCOr2hK2+D/fTfe2FMC6WY0xoLZN4yw3eUp1i4612NRo0IlXokbPHxmWTWd8FCwFsBHeb8YFtCAR1nTTqAn7uhpBsGDQ8vgwwYkJfUsbKgOeoNuoy0GfFAZ9cRgqMNS70IK+Tav9DXWQyC/u/iF6CVstbYN4sGitvqRZvx/gUMPaNTWdIaFHTbFJSC9qTK0da5hP7dTBKDRKcD7Gipqog4nAUD03aAG1NhFclMZWqVM0BOWsywItXhax2AG1OWLL73MRv3BC1x9BZ0StoEXGTq02tXClWeNNpY/gRtYHGowb6cWUHpSEogbVrMp2MXJCOVHLHAF+xOTmS4F2ow8Dwh1F+hSyWlsk2WB+Rj3fIhpwQfj7ikMzHqJVmlQZG3rzFvxitKJ5pGIopROuGwCFUaSIst40xr0EzWrFM82wxPqxUWEJhYbR6NTmtKJG19hIP/bMuIkI66vUAjZjGD4sMI//Sm+/kVgD5WoF2pS0hx+LERPdoomeb6v8Nmfb9Glxt3ZmFAQVKDOQXssw702rD94L0D6iZ8jUfkEPfk5okQeQ1g70UTTpXEMq2MwSL1g0phZ7A1qXLBLD1rzNaNas3qxVHrpecd3SE0NktvNZM0sXWpfGgsQ2bVYaVs4Pd6z+9ibjNlPi8AaYoM0RfUtXPO8Xmf01OAQqcrUbU+oD4uW8xgSqdSisVAPyFMACkDfEhM/rhfpGIrGhsNxQgi2XKaIwryarbawVG+T553AngO2dLwShthlV4TVNl0NB7+zmxH2IoMnLU6S5oPELUjrH9e9B1ifJRJNnRfuK3wjpse5BAafJ7HfvZ5+pjjyUcni6F8bUoFWDobdWNK595U2Oy4m3C8qeF4s+zbtpDEPo2qpuV8neqsWKJ6Yh/Qa87wBzQi6vlQBZwPpvw51S++g3W0kkCs7EwkVYNVq+IA5IOiPfqvC90BsVFr2VUrH/KGhF8S2p+lSdfwiUzed0tOx9l/8DsJy8uIF2UFuHRSNgvV/DGXU6/E/kaALKOm3KjHq4Zo3ba8Kho+4SO/43aLjyuybo2cbC9X1vYArpAvoP4GJNQ3xWpUgAAAAASUVORK5CYII=";
      })
    });
  }

}
